import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase.js";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
// import "./Signup.css";
import { addDoc, collection } from "@firebase/firestore";
import { useRouter } from "next/router";
import ContactFooter from "./ContactFooter.js";
import Head from "next/head";

function Signup(props) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user && auth.currentUser.emailVerified) {
        const uid = user.uid;
        router.push("/");
      } else {
        setLoading(false);
      }
    });
  }, []);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const check_fields = () => {
    if (
      firstName == "" ||
      lastName == "" ||
      email == "" ||
      password == "" ||
      confirmPassword == ""
    ) {
      return false;
    }

    return true;
  };

  const handleCancelClick = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  let curr_user;
  let joined_on;
  const register = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return alert("Password and Confirm Password did not match");
    }
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    createUserWithEmailAndPassword(auth, email, password).then(
      (userCredential) => {
        const user = userCredential.user;
        curr_user = auth.currentUser;
        joined_on = new Date();
        const addNewUser = async () => {
          const new_user = await addDoc(collection(db, "users"), {
            firstName,
            lastName,
            email,
            uid: curr_user.uid,
            short_description: `Hello everyone  , I am browsing on Pennedit.in`,
            following: [],
            followers: [],
            categories_chosen: [],
            posts_made: [],
            questions_asked: [],
            answers: [],
            location: "Not updated",
            joined_on,
            profilePic: {},
            coverPic: {},
          });
        };

        addNewUser();
        sendEmailVerification(auth.currentUser)
          .then(() => {
            signOut(auth).then(() => {
              router.push("/");
              alert("Verification mail sent to ", email);
            });
          })

          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert("Error encountered ");
            return;
          });
      }
    );
  };

  return (
    <div className="signup">
      {!loading && (
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
              crossorigin="anonymous"
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
              crossorigin="anonymous"
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
          <div className="signup-header">
            <span className="first-name">Pennedit</span>
          </div>

          <div className="signup-body">
            <div className="signup-body-img">
              <img
                src="https://image.freepik.com/free-vector/business-man-working-hard-stock-financial-trade-market-diagram-vector-illustration-flat-design_1150-39773.jpg"
                alt="signup-image"
              />
            </div>

            <div className="signup-form">
              <div className="signup-form-top">
                <p className="signup-form-header">Sign Up</p>
                <p className="signup-form-starting">
                  <span>Enter your details to create your account</span>
                </p>
              </div>

              <div className="signup-form-middle">
                <div className="signup-form-name">
                  <div className="signup-form-nameField">
                    <p>First Name</p>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      type="text"
                      placeholder="First Name"
                      required
                    />
                  </div>

                  <div className="signup-form-nameField">
                    <p>Last Name</p>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      type="text"
                      placeholder="Last Name"
                      required
                    />
                  </div>
                </div>

                <div className="signup-form-field">
                  <p>Email</p>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="abc@xyz.com"
                    required
                  />
                </div>

                <div className="signup-form-field">
                  <p>Password</p>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Enter Password"
                    required
                  />
                </div>

                <div className="signup-form-field last-signup-field">
                  <p>Confirm Password</p>
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    placeholder="Confirm Password"
                    required
                  />
                </div>
              </div>

              <div className="signup-form-submit">
                <div className="signup-checkbox">
                  <span className="signup-conditions-plain">
                    Kindly verify your email after Signup
                  </span>
                  {/* <span className="signup-conditons-link">
                  Email Verification link will be sent
                </span> */}
                </div>

                <div className="signup-form-buttons">
                  {check_fields() && (
                    <button className="signup-submit-button" onClick={register}>
                      Submit
                    </button>
                  )}

                  {!check_fields() && (
                    <button className="signup-submit-button disabled-signup-button">
                      Submit
                    </button>
                  )}

                  <button
                    className="signup-cancel-button"
                    onClick={handleCancelClick}
                  >
                    Cancel
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
      )}
    </div>
  );
}

export default Signup;
