import SingleQuestionPage from "../../components/SingleQuestionPage";
import { useRouter } from "next/router";
import { auth, db, storage, app } from "../../firebase";
import { getFirestore } from "firebase/firestore";
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
  Timestamp,
} from "firebase/firestore";
import Head from "next/head";

function SingleQuestionPageFunction(props) {
  const router = useRouter();
  const { questionId } = router.query;
  const questionData = JSON.parse(props.questionData);
  const questionFirstAnswer = props.questionFirstAnswer;
  return (
    <>
      <Head>
        {questionFirstAnswer === "" ? (
          <>
            <meta
              name="description"
              content="Pennedit is a question-and-answer website which allows users to post, ask questions and answer others based on their favourite categories and keep themselves updated regarding the latest developments in their field of interest. "
            />
            <meta
              property="og:description"
              content="Pennedit is a question-and-answer website which allows users to post, ask questions and answer others based on their favourite categories and keep themselves updated regarding the latest developments in their field of interest. "
            />
          </>
        ) : (
          <>
            <meta
              name="description"
              content={`${questionData.answers.length} Answers - ${questionFirstAnswer}`}
            />

            <meta
              name="og:description"
              content={`${questionData.answers.length} Answers - ${questionFirstAnswer}`}
            />
          </>
        )}

        <title>
          {`(${questionData.answers.length})`} {questionData.question_content} –
          Pennedit.in
        </title>
        <meta
          property="og:title"
          content={`(${questionData.answers.length}) ${questionData.question_content} –
          Pennedit.in`}
        />
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
      <SingleQuestionPage questionId={questionId} />{" "}
    </>
  );
}

export default SingleQuestionPageFunction;

export async function getServerSideProps(context) {
  try {
    const { params } = context;
    const questionRef = doc(db, "questions", params.questionId);
    const questionSnap = await getDoc(questionRef);

    if (!questionSnap.exists()) {
      return {
        redirect: {
          permanent: false,
          destination: "/404",
        },
        props: {},
      };
    }
    const questionData = questionSnap.data();
    const answersRef = collection(db, "answers");
    const getAllAnswers = query(
      answersRef,
      where("question_id", "==", params.questionId),
      orderBy("timestamp")
    );
    const queryAnswersSnapshot = await getDocs(getAllAnswers);
    let questionFirstAnswer = "";
    queryAnswersSnapshot.forEach((singleAnswer) => {
      if (questionFirstAnswer === "") {
        questionFirstAnswer = singleAnswer.data().answer_content;
      }
    });

    return {
      props: {
        questionData: JSON.stringify(questionData),
        questionFirstAnswer,
      },
    };
  } catch (error) {
    return {
      props: {},
    };
  }
}
