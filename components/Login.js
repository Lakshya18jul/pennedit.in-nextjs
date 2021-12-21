import React, { useState, useEffect } from "react";
// import "./Login.css";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRecoilState } from "recoil";
import { userState } from "../atoms/userAtom";
import { auth, db, provider } from "../firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";

import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import ContactFooter from "./ContactFooter.js";
import Head from "next/head";

function Login(props) {
  const router = useRouter();
  const [currUserState, setCurrUserState] = useRecoilState(userState);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const check_fields = () => {
    if (email == "" || password == "") {
      return false;
    }
    return true;
  };

  let curr_user;

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        curr_user = auth.currentUser;
        setEmail("");
        setPassword("");
      })
      .then(async () => {
        if (auth.currentUser.emailVerified) {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("uid", "==", curr_user.uid));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            setCurrUserState(doc.data());
          });

          location.reload();
        } else {
          signOut(auth).then(() => {
            router.push("/");
            alert("This Email has not been verified");
          });
        }
      })
      .catch((error) => {
        alert("Invalid Username/Password");
      });
  };

  const handleGoogleSignIn = () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        curr_user = auth.currentUser;
        auth.currentUser.emailVerified = true;
        const usersRef = collection(db, "users");
        let q = query(usersRef, where("uid", "==", curr_user.uid));
        let querySnapshot = await getDocs(q);
        if (querySnapshot.docs.length === 0) {
          const addNewUser = async () => {
            const name_separated = curr_user.displayName.split(" ");
            const firstName = name_separated[0];
            const lastName = name_separated[1];
            const new_user = await addDoc(collection(db, "users"), {
              firstName,
              lastName,
              email: curr_user.email,
              uid: curr_user.uid,
              short_description: `Hello everyone  , I am browsing on Pennedit.in`,
              following: [],
              followers: [],
              categories_chosen: [],
              posts_made: [],
              questions_asked: [],
              answers: [],
              location: "Not updated",
              joined_on: new Date(),
              coverPic: {},
              profilePic: {},
            });
          };

          addNewUser();
        }

        q = query(usersRef, where("uid", "==", curr_user.uid));
        querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          setCurrUserState(doc.data());
        });

        location.reload();
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        alert("Error during google signin ");
      });
  };

  const handleForgotPassword = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Password reset mail sent to ", email);
      })
      .catch((error) => {
        alert("User Not Found");
      });
  };

  return (
    <div className="login">
      <React.Fragment>
        <Head>
          <meta
            name="description"
            content="Pennedit is a question-and-answer website which allows users to post, ask questions and answer others based on their favourite categories and keep themselves updated regarding the latest developments in their field of interest. "
          />
          <title>Pennedit</title>
          <link
            rel="stylesheet"
            href="https://use.fontawesome.com/releases/v5.15.4/css/all.css"
            integrity="sha384-DyZ88mC6Up2uqS4h/KRgHuoeGwBcD4Ng9SiP4dIRy0EXTlnuz47vAwmeGwVChigm"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css?family=Nunito"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css?family=Pacifico"
            rel="stylesheet"
          />

          <link
            rel="stylesheet"
            href="https://use.fontawesome.com/releases/v5.15.4/css/all.css"
            integrity="sha384-DyZ88mC6Up2uqS4h/KRgHuoeGwBcD4Ng9SiP4dIRy0EXTlnuz47vAwmeGwVChigm"
            crossOrigin="anonymous"
          />
          <link
            rel="icon"
            href="https://firebasestorage.googleapis.com/v0/b/pennedit-d53c8.appspot.com/o/pennedit-inapp-images%2Fdownload.png?alt=media&token=30917a0f-c98c-4a77-971b-3dcb02efcb54"
          />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1 , minimum-scale=1"
          />
        </Head>
        <div className="login-header">
          <span className="first-name">Pennedit</span>
        </div>

        <div className="login-body">
          <div className="login-body-img">
            <img
              src="https://image.freepik.com/free-vector/business-man-working-hard-stock-financial-trade-market-diagram-vector-illustration-flat-design_1150-39773.jpg"
              alt="login-image"
            />
          </div>

          <div className="login-form">
            <div className="login-form-top">
              <p className="login-form-header">Welcome to Start</p>
              <p className="login-form-signup">
                <span className="login-form-signup-header">New Here?</span>
                <Link href="/signup">
                  <a>
                    <span className="login-form-signup-link">
                      Create Account
                    </span>
                  </a>
                </Link>
              </p>
            </div>

            <div className="login-form-middle">
              <div className="login-form-email">
                <p>Email</p>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="abc@xyz.com"
                />
              </div>

              <div className="login-form-password">
                <div className="password-typing">
                  <p>Password</p>
                  {email == "" ? (
                    <span className="forgot-password-disable">
                      Forgot Password ?
                    </span>
                  ) : (
                    <span
                      onClick={handleForgotPassword}
                      className="forgot-password-active"
                    >
                      Forgot Password ?
                    </span>
                  )}
                </div>

                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                />
              </div>
            </div>

            <div className="login-form-submit">
              <div className="form-buttons">
                {check_fields() ? (
                  <button className="signin-button" onClick={handleSignIn}>
                    Sign In
                  </button>
                ) : (
                  <button className=" signin-button disabled-signup-button">
                    Sign In
                  </button>
                )}

                <button
                  className="google-signin-button"
                  onClick={handleGoogleSignIn}
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
                    alt="google-icon"
                  />
                  <span className="google-signin-largewidth">
                    Sign in with Google{" "}
                  </span>
                  <span className="google-signin-smallwidth">Sign in </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="aboutus-pennedit-section">
          <span className="aboutus-heading">About Us</span>
          <span className="aboutus-content">
            Pennedit is a question-and-answer website which allows users to
            post, ask questions and answer others based on their favourite
            categories and keep themselves updated regarding the latest
            developments in their field of interest.
          </span>
        </div>

        <ContactFooter />
      </React.Fragment>
    </div>
  );
}

export default Login;
