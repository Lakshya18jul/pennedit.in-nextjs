import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { useRecoilState } from "recoil";
import { userState } from "../atoms/userAtom";
import Login from "../components/Login";
import Home from "../components/Home";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

function HomePage() {
  const [currUserState, setCurrUserState] = useRecoilState(userState);
  const [returnLogin, setReturnLogin] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (!user || !auth.currentUser.emailVerified) {
        setReturnLogin(true);
      } else if (user && auth.currentUser.emailVerified) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          setCurrUserState(doc.data());
        });

        // setReturnLogin(false);
      }
    });
  }, []);

  return <>{returnLogin ? <Login /> : <Home />}</>;
}

export default HomePage;
