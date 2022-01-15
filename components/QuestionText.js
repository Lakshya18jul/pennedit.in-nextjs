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

  const compressQuestion = (questionText) => {
    if (questionText.length > 65) {
      const new_string = questionText.substr(0, 65);
      return new_string;
    } else {
      return questionText;
    }
  };

  return (
    <React.Fragment>
      {!loading && questionContent.length > 65 ? (
        <span>{compressQuestion(questionContent)}...</span>
      ) : (
        <span>{questionContent}</span>
      )}
    </React.Fragment>
  );
}

export default QuestionText;
