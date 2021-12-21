import { RecoilRoot } from "recoil";
import "../styles/globals.css";
import "../styles/Answer.css";
import "../styles/AnswerWithQues.css";
import "../styles/Categories.css";
import "../styles/Comment.css";
import "../styles/ContactFooter.css";
import "../styles/Feed.css";
import "../styles/Following.css";
import "../styles/FollowingProfile.css";
import "../styles/Header.css";
import "../styles/Home.css";
import "../styles/HomeLeftSidebar.css";
import "../styles/LoadingName.css";
import "../styles/Login.css";
import "../styles/NavSidebar.css";
import "../styles/Notifications.css";
import "../styles/Page404.css";
import "../styles/Post.css";
import "../styles/Profile.css";
import "../styles/Question.css";
import "../styles/RightSidebar.css";
import "../styles/Signup.css";
import "../styles/SingleCategory.css";
import "../styles/SingleQuestionPage.css";

function MyApp({ Component, pageProps }) {
  return (
    <RecoilRoot>
      <Component {...pageProps} />
    </RecoilRoot>
  );
}

export default MyApp;
