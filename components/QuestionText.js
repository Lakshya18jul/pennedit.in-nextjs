import React, { useEffect, useState } from "react";
import { db } from "../firebase.js";
import { getDoc, doc } from "firebase/firestore";

function QuestionText(props) {
  const { questionId } = props;
  const [loading, setLoading] = useState(true);
  const [questionContent, setQuestionContent] = useState("");

  useEffect(async () => {
    const questionRef = doc(db, "questions", questionId);
    const questionSnap = await getDoc(questionRef);

    if (questionSnap.exists()) {
      setQuestionContent(questionSnap.data().question_content);
      setLoading(false);
    }
  }, []);

  return (
    <React.Fragment>
      {!loading && <span>{questionContent}</span>}
    </React.Fragment>
  );
}

export default QuestionText;
