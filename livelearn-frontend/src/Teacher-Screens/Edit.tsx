import "./Edit.css";
import CheckboxQuestion from "./Components/CheckBoxQuestion";
import TextQuestion from "./Components/TextQuestion";
import RadioQuestion from "./Components/RadioQuestion";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Menu,
  MenuItem,
  Stack,
  TextField
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Header from "../Components/Header";
import { SettingsDropdown } from "./Components/SettingsDropdown";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

function Edit() {
  type QuestionType = "checkbox" | "radio" | "text";

  interface Question {
    id: string;
    type: QuestionType;
    title: string;
    choices?: string[];
    images?: string[];
    points?: number;
    answers?: string[];
  }

  const location = useLocation();
  const { pollId } = location.state || {};

  const [name, setName] = useState("Loading...");
  const [editingName, setEditingName] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [graded, setGraded] = useState(false);
  const [completion, setCompletion] = useState(false);
  const [loading, setLoading] = useState(true);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchPoll = async () => {
      if (!pollId) return;

      setLoading(true);
      try {
        const docRef = doc(db, "polls", pollId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const pollData = docSnap.data();
          setName(pollData.title);
          setQuestions(pollData.questions || []);
          setGraded(pollData.graded || false);
          setCompletion(pollData.completion || false);
        } else {
          console.error("Poll could not be found");
        }
      } catch (err) {
        console.error("Error loading poll:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
  }, [pollId]);

  const updateTotalPoints = async (updatedQuestions: Question[]) => {
    if (!pollId) return;
    const total = updatedQuestions.reduce((sum, q) => sum + (q.points ?? 1), 0);
    const pollRef = doc(db, "polls", pollId);
    await updateDoc(pollRef, { questions: cleanQuestions(updatedQuestions), points: total });
  };

  const handleAddButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const addQuestion = async (type: QuestionType) => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Question`,
      choices: type === "text" ? [] : ["Choice 1", "Choice 2", "Choice 3"],
      images: [],
      points: 1,
      answers: [],
    };

    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    handleClose();

    await updateTotalPoints(updatedQuestions);
  };

  const startEditingName = () => {
    setEditingName(true);
  };

  const saveName = async () => {
    setEditingName(false);
    try {
      if (!pollId) return;
      const pollRef = doc(db, "polls", pollId);
      await updateDoc(pollRef, { title: name });
    } catch (error) {
      console.error("Failed to update poll title:", error);
    }
  };

  const updateQuestionTitle = async (id: string, newTitle: string) => {
    const updated = questions.map((q) =>
      q.id === id ? { ...q, title: newTitle } : q
    );
    setQuestions(updated);
    await updateTotalPoints(updated);
  };

  const updateQuestionChoices = async (id: string, newChoices: string[]) => {
    const updated = questions.map((q) =>
      q.id === id ? { ...q, choices: newChoices } : q
    );
    setQuestions(updated);
    await updateTotalPoints(updated);
  };

  const updateQuestionImages = async (id: string, newImages: string[]) => {
    const updated = questions.map((q) =>
      q.id === id ? { ...q, images: newImages } : q
    );
    setQuestions(updated);
    await updateTotalPoints(updated);
  };

  const updateQuestionPoints = async (id: string, newPoints: number) => {
    const updated = questions.map((q) =>
      q.id === id ? { ...q, points: newPoints } : q
    );
    setQuestions(updated);
    await updateTotalPoints(updated);
  };

  const handleAnswersChange = async (id: string, newAnswers: string[]) => {
    const updated = questions.map((q) =>
      q.id === id ? { ...q, answers: newAnswers } : q
    );
    setQuestions(updated);
    await updateTotalPoints(updated);
  };

  const deleteQuestion = async (id: string) => {
    const updatedQuestions = questions.filter((q) => q.id !== id);
    setQuestions(updatedQuestions);
    await updateTotalPoints(updatedQuestions);
  };

  const cleanQuestions = (list: Question[]) =>
    list.map(({ id, title, type, choices, images, points, answers }) => ({
      id,
      title,
      type,
      choices: choices || [],
      images: images || [],
      points: points ?? 1,
      answers: answers || [],
    }));

  const navigate = useNavigate();
  const handleBackClick = () => navigate(-1);

  return (
    <div className="app-container">
      <Header />
      <ArrowBackIcon className="btn-back" onClick={handleBackClick} />
      <div className="question-container">
        <div className="new-question-div">
          <div className="poll-title">
            {editingName ? (
              <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ width: "100%" }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={saveName}
                  autoFocus
                  size="small"
                  multiline
                  minRows={1}
                  maxRows={4}
                />
              </Stack>
            ) : (
              <Box mb={0} sx={{ display: "flex", alignItems: "flex-start" }}>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{ flex: 1, wordBreak: "break-word", lineHeight: 1.5, paddingRight: 1, cursor: "pointer" }}
                  onClick={startEditingName}
                >
                  {name}
                </Typography>
              </Box>
            )}
          </div>
          <div className="question-menu">
            <button className="add-question-btn" onClick={handleAddButtonClick}>
              <AddIcon fontSize="inherit" /> Add Question
            </button>
            <SettingsDropdown
              pollId={pollId}
              graded={graded}
              completion={completion}
              onUpdate={({ graded, completion }) => {
                setGraded(graded);
                setCompletion(completion);
              }}
            />
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={() => addQuestion("checkbox")} sx={{ gap: 1 }}>
                <CheckBoxIcon fontSize="small" />
                Checkbox Question
              </MenuItem>
              <MenuItem onClick={() => addQuestion("radio")} sx={{ gap: 1 }}>
                <RadioButtonCheckedIcon fontSize="small" />
                Radio Question
              </MenuItem>
              <MenuItem onClick={() => addQuestion("text")} sx={{ gap: 1 }}>
                <TextFieldsIcon fontSize="small" />
                Text Question
              </MenuItem>
            </Menu>
          </div>
        </div>

        {loading ? (
          <div className="empty-question-state" style={{ textAlign: "center", marginTop: "2rem" }}>
            <Typography variant="body1" color="text.secondary">
              Loading...
            </Typography>
          </div>
        ) : questions.length === 0 ? (
          <div className="empty-question-state">
            <Typography variant="body1" color="text.secondary" align="center" sx={{ my: 4 }}>
              No questions added yet. Click "Add Question" to get started.
            </Typography>
          </div>
        ) : (
          questions.map((question) => {
            const commonProps = {
              id: question.id,
              initialQuestion: question.title,
              initialImages: question.images || [],
              onQuestionChange: (newTitle: string) => updateQuestionTitle(question.id, newTitle),
              onImagesChange: (newImages: string[]) => updateQuestionImages(question.id, newImages),
              onDelete: () => deleteQuestion(question.id),
              initialPoints: question.points ?? 1,
              onPointsChange: (newPoints: number) => updateQuestionPoints(question.id, newPoints),
              answers: question.answers || [],
              onAnswersChange: (newAnswers: string[]) => handleAnswersChange(question.id, newAnswers),
            };

            if (question.type === "radio") {
              return (
                <RadioQuestion
                  key={question.id}
                  {...commonProps}
                  initialChoices={question.choices || []}
                  onChoicesChange={(newChoices) => updateQuestionChoices(question.id, newChoices)}
                />
              );
            } else if (question.type === "checkbox") {
              return (
                <CheckboxQuestion
                  key={question.id}
                  {...commonProps}
                  initialChoices={question.choices || []}
                  onChoicesChange={(newChoices) => updateQuestionChoices(question.id, newChoices)}
                />
              );
            } else if (question.type === "text") {
              return <TextQuestion key={question.id} {...commonProps} />;
            }
            return null;
          })
        )}
      </div>
    </div>
  );
}

export default Edit;
