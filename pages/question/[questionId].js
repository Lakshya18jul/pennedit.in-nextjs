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

function SingleQuestionPageFunction(props) {
  const router = useRouter();
  const { questionId } = router.query;
  return (
    <SingleQuestionPage
      questionId={questionId}
      questionSnap={props.questionSnap}
      //   questionId={questionId}
      //   questionData={props.questionData}
      //   questionFirstAnswer={props.questionFirstAnswer}
    />
  );
}

export default SingleQuestionPageFunction;

export async function getServerSideProps(context) {
  try {
    const params = context.params;
    const querySnapshot = await getDocs(
      collection(getFirestore(app), "questions")
    );
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
    });

    return {
      props: {
        questionSnap: params,
      },
    };

    // if (!questionSnap.exists()) {
    //   return {
    //     redirect: {
    //       permanent: false,
    //       destination: "/404",
    //     },
    //     props: {},
    //   };
    // }
    // const questionData = questionSnap.data();
    // const answersRef = collection(db, "answers");

    // const getAllAnswers = query(
    //   answersRef,
    //   where("question_id", "==", params.questionId),
    //   orderBy("timestamp")
    // );

    // const queryAnswersSnapshot = await getDocs(getAllAnswers);
    // let questionFirstAnswer = "";
    // queryAnswersSnapshot.forEach((singleAnswer) => {
    //   if (questionFirstAnswer === "") {
    //     questionFirstAnswer = singleAnswer.data().answer_content;
    //   }
    // });

    // return {
    //   props: {
    //     questionData: JSON.stringify(questionData),
    //     questionFirstAnswer,
    //   },
    // };
  } catch (error) {
    console.log("Error", error);
    return {
      props: {},
    };
  }
}
