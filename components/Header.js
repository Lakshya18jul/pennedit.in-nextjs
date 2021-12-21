import React, { useState, useEffect } from "react";
// import "./Header.css";
import Link from "next/link";
import { useRouter } from "next/router";
import { auth, db, storage } from "../firebase.js";
import NavSidebar from "./NavSidebar";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  getDoc,
  doc,
  updateDoc,
  orderBy,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { useRecoilState } from "recoil";
import { userState } from "../atoms/userAtom";

function Header(props) {
  const [profileName, setProfileName] = useState("");
  const [relatedSearches, setRelatedSearches] = useState([]);
  const [notificationDot, setNotificationDot] = useState(false);
  const [navSidebar, setNavSidebar] = useState(false);
  const [currUserState, setCurrUserState] = useRecoilState(userState);
  const router = useRouter();

  useEffect(async () => {
    if (profileName.length > 0) {
      const querySnapshot = await getDocs(collection(db, "users"));
      let profileSearched = profileName.toLowerCase();
      let searchArray = [];

      querySnapshot.forEach((doc) => {
        let profileFromdb = doc.data().firstName + " " + doc.data().lastName;
        let profileFromdbLowercase = profileFromdb.toLowerCase();

        if (
          profileFromdbLowercase
            .slice(0, profileSearched.length)
            .indexOf(profileSearched) !== -1
        ) {
          let profilePicUrl =
            "https://firebasestorage.googleapis.com/v0/b/pennedit-d53c8.appspot.com/o/pennedit-inapp-images%2Fuser%20avatar.png?alt=media&token=2cab7ab4-6d8b-4f94-9113-87db6b4015f1";
          if (JSON.stringify(doc.data().profilePic) !== "{}") {
            const imageRef = ref(
              storage,
              `images/${doc.id}/${doc.data().profilePic.name}`
            );
            getDownloadURL(imageRef)
              .then((url) => {
                profilePicUrl = url;
                let matchedProfile = {
                  name: profileFromdb,
                  doc_id: doc.id,
                  profilePicUrl,
                };
                searchArray.push(matchedProfile);
                setRelatedSearches([...searchArray]);
              })
              .catch((error) => {
                alert("Error encountered in downloading the URL");
              });
          } else {
            let matchedProfile = {
              name: profileFromdb,
              doc_id: doc.id,
              profilePicUrl,
            };
            searchArray.push(matchedProfile);
            setRelatedSearches([...searchArray]);
          }
        }
      });
    } else {
      setRelatedSearches([]);
    }
  }, [profileName]);

  const handleSearchClick = (doc_id) => {
    router.push(`/profile/${doc_id}`);
    window.location.reload();
  };

  useEffect(async () => {
    if (currUserState) {
      let curr_signed_user;
      const q1 = query(
        collection(db, "users"),
        where("uid", "==", currUserState.uid)
      );
      const querySnapshot1 = await getDocs(q1);
      querySnapshot1.forEach((user) => {
        curr_signed_user = user.id;
      });
      const q2 = query(
        collection(db, "users", curr_signed_user, "notifications"),
        orderBy("timestamp", "desc")
      );
      const unsubscribe = onSnapshot(q2, (notificationSnapshot) => {
        notificationSnapshot.forEach(async (notification) => {
          if (!notification.data().isViewed && !notificationDot) {
            setNotificationDot(true);
          }
        });
      });
      return () => unsubscribe();
    }
  }, [currUserState]);

  const handleNotificationClick = async () => {
    let curr_signed_user;
    const q1 = query(
      collection(db, "users"),
      where("uid", "==", currUserState.uid)
    );

    const querySnapshot1 = await getDocs(q1);
    querySnapshot1.forEach((user) => {
      curr_signed_user = user.id;
    });

    if (notificationDot) {
      setNotificationDot(false);

      const q = query(
        collection(db, "users", curr_signed_user, "notifications"),
        where("isViewed", "==", false)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (notificationSnap) => {
        const notificationRef = doc(
          db,
          "users",
          curr_signed_user,
          "notifications",
          notificationSnap.id
        );

        await updateDoc(notificationRef, {
          isViewed: true,
        });
      });
    }
  };

  return (
    <div className="header">
      <div className="header-logo">
        <Link href="/">
          <a>
            <span className="logo-name-large">Pennedit</span>
          </a>
        </Link>

        {currUserState ? (
          <Link href="/">
            <a>
              <span className="logo-name-small">P</span>
            </a>
          </Link>
        ) : (
          <Link href="/">
            <a>
              <span className="logo-name-small">Pennedit</span>
            </a>
          </Link>
        )}
      </div>

      {currUserState && (
        <React.Fragment>
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="People on Pennedit"
                onChange={(e) => setProfileName(e.target.value)}
                value={profileName}
              />
              {profileName !== "" ? (
                <i class="fas fa-times" onClick={() => setProfileName("")}></i>
              ) : (
                <i class="fas fa-search"></i>
              )}
            </div>

            {profileName.length !== 0 && (
              <div className="show-search-results">
                {relatedSearches.length !== 0 ? (
                  relatedSearches.map((search) => {
                    return (
                      <div
                        className="single-search"
                        onClick={() => handleSearchClick(search.doc_id)}
                      >
                        <img
                          src={search.profilePicUrl}
                          alt="search-img"
                          className="search-img"
                        />

                        <span className="search-name">{search.name}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-search-result">No related searches</div>
                )}
              </div>
            )}
          </div>

          <div className="header-options">
            <div className="header-NavOptions">
              <Link href="/">
                <a>
                  <div className="header-NavOption">
                    <i class="fas fa-home"></i>
                    <span>Home</span>
                  </div>
                </a>
              </Link>

              <Link href="/answer">
                <a>
                  <div className="header-NavOption">
                    <i class="fas fa-edit"></i>
                    <span>Answer</span>
                  </div>
                </a>
              </Link>

              <Link href="/categories">
                <a>
                  <div className="header-NavOption">
                    <i class="fas fa-list"></i>
                    <span>Categories</span>
                  </div>
                </a>
              </Link>

              <div className="header-NavOption">
                <Link href="/notifications">
                  <a>
                    <div
                      className="notification-symbol"
                      onClick={handleNotificationClick}
                    >
                      <div className="notification-icon">
                        <i class="fas fa-bell"></i>
                        {notificationDot && (
                          <div className="notification-red-symbol"></div>
                        )}
                      </div>

                      <span>Notifications</span>
                    </div>
                  </a>
                </Link>
              </div>

              <Link href="/following">
                <a>
                  <div className="header-NavOption">
                    <i class="fas fa-paper-plane"></i>
                    <span>Following</span>
                  </div>
                </a>
              </Link>
            </div>

            <div
              className="showHamburger header-NavOption "
              onClick={() => setNavSidebar(true)}
            >
              <i class="fas fa-bars"></i>
              {notificationDot && (
                <div className="notification-red-symbol-bars"></div>
              )}
            </div>

            <div className={navSidebar ? "nav-menu-active" : "nav-menu"}>
              <NavSidebar
                showNavSidebar={setNavSidebar}
                isNotificationDot={notificationDot}
                handleNotificationClick={handleNotificationClick}
              />
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

export default Header;
