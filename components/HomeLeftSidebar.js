import React, { useState, useEffect } from "react";
// import "./HomeLeftSidebar.css";
import Link from "next/link";
import { useRouter } from "next/router";
import { auth, db } from "../firebase.js";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase.js";
import { useRecoilState } from "recoil";
import { userState } from "../atoms/userAtom";

function HomeLeftSidebar(props) {
  const router = useRouter();
  const [currUserState, setCurrUserState] = useRecoilState(userState);
  const [loading, setLoading] = useState(true);
  const [getSignedDocid, setSignedDocid] = useState("");
  const [profileImageLink, setProfileImageLink] = useState(null);
  const [coverImageLink, setCoverImageLink] = useState(null);

  const {
    firstName,
    lastName,
    short_description,
    followers,
    following,
    uid,
    profilePic,
    coverPic,
  } = currUserState;

  useEffect(async () => {
    let curr_signed_user_docid;
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((user) => {
      curr_signed_user_docid = user.id;
      setSignedDocid(user.id);
    });

    if (JSON.stringify(coverPic) === "{}") {
      setCoverImageLink(null);
    } else {
      const imageRef = ref(
        storage,
        `images/${curr_signed_user_docid}/${coverPic.name}`
      );
      getDownloadURL(imageRef)
        .then((url) => {
          setCoverImageLink(url);
        })
        .catch((error) => {
          alert("Error in downloading the url");
        });
    }

    if (JSON.stringify(profilePic) === "{}") {
      setProfileImageLink(null);
      setLoading(false);
    } else {
      const imageRef = ref(
        storage,
        `images/${curr_signed_user_docid}/${profilePic.name}`
      );
      getDownloadURL(imageRef)
        .then((url) => {
          setProfileImageLink(url);
          setLoading(false);
        })
        .catch((error) => {
          alert("Error in downloading the url");
        });
    }
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        router.push("/");
      })
      .catch((error) => {
        alert("Error found on logging out");
      });
  };

  return (
    <React.Fragment>
      {!loading && (
        <React.Fragment>
          <div className="left-sidebar">
            {coverImageLink ? (
              <img
                src={`${coverImageLink}`}
                alt="cover-Image"
                className="leftSidebar-cover-image"
              />
            ) : (
              <img
                src="https://images.ctfassets.net/7thvzrs93dvf/wpImage18643/2f45c72db7876d2f40623a8b09a88b17/linkedin-default-background-cover-photo-1.png?w=790&h=196&q=90&fm=png
                "
                alt="coverr-image"
                className="leftSidebar-cover-image"
              />
            )}
            <div className="left-sidebar-top">
              {profileImageLink ? (
                <img
                  src={`${profileImageLink}`}
                  alt="profile-Image"
                  className="leftSidebar-profile-image"
                />
              ) : (
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/pennedit-d53c8.appspot.com/o/pennedit-inapp-images%2Fuser%20avatar.png?alt=media&token=2cab7ab4-6d8b-4f94-9113-87db6b4015f1
                "
                  alt="profile-image"
                  className="leftSidebar-profile-image"
                />
              )}

              <span className="user-name">
                {firstName} {lastName}
              </span>
              <span className="user-description">{short_description}</span>
            </div>

            <div className="left-sidebar-middle">
              <div className="people-count">
                <span className="count-num">{following.length}</span>
                <span className="count-category">Following</span>
              </div>

              <div className="people-count">
                <span className="count-num">{followers.length}</span>
                <span className="count-category">Followers</span>
              </div>
            </div>

            <div className="left-sidebar-bottom">
              <Link href={`/profile/${getSignedDocid}`}>
                <a>
                  <div className="left-sidebar-navigation">
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Fuser-profile-icon.png?alt=media&token=625aed7b-f9a1-4d1c-a624-492227bdde2b"
                      alt="user-profile-icon-leftsidebar"
                    />
                    <span className="sidebar-navOption">Profile</span>
                  </div>
                </a>
              </Link>

              <div className="left-sidebar-navigation" onClick={handleLogout}>
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Flogout%20icon.png?alt=media&token=533940c8-453a-4b8f-b636-c1091cb63658"
                  alt="sign-out-icon-leftsidebar"
                />
                <span className="sidebar-navOption">Logout</span>
              </div>
            </div>
          </div>
        </React.Fragment>
      )}

      {loading && <div className="left-sidebar"></div>}
    </React.Fragment>
  );
}

export default HomeLeftSidebar;
