import React, { useState, useEffect } from "react";
// import "./FollowingProfile.css";
import { db, storage } from "../firebase.js";
import Link from "next/link";
import { getDoc, doc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

function FollowingProfile(props) {
  const { followingId } = props;
  const [loading, setLoading] = useState(true);
  const [dataToUse, setDataToUse] = useState({});
  const [profilePicUrl, setProfilePicUrl] = useState(null);

  const { firstName, lastName, short_description } = dataToUse;

  useEffect(async () => {
    const userRef = doc(db, "users", followingId);
    const userSnap = await getDoc(userRef);

    setDataToUse(userSnap.data());
    if (JSON.stringify(userSnap.data().profilePic) !== "{}") {
      const imageRef = ref(
        storage,
        `images/${followingId}/${userSnap.data().profilePic.name}`
      );
      getDownloadURL(imageRef)
        .then((url) => {
          setProfilePicUrl(url);
          setLoading(false);
        })
        .catch((error) => {
          alert("Error in downloading the url");
        });
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <React.Fragment>
      {!loading && (
        <div className="following-profile">
          <div className="following-profile-content">
            <img
              src={
                profilePicUrl
                  ? profilePicUrl
                  : "https://firebasestorage.googleapis.com/v0/b/pennedit-d53c8.appspot.com/o/pennedit-inapp-images%2Fuser%20avatar.png?alt=media&token=2cab7ab4-6d8b-4f94-9113-87db6b4015f1"
              }
              alt="following-creator-img"
              className="following-creator-image"
            />
            <div className="following-profile-info">
              <Link href={`/profile/${followingId}`}>
                <a>
                  <h2>
                    {firstName} {lastName}
                  </h2>
                </a>
              </Link>
              <div className="following-profile-info-details">
                <span>{short_description}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

export default FollowingProfile;
