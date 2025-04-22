import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import MCQ from "./MCQ";
import FRQ from "./FRQ";
import Checkbox from "./CheckboxQ";
import Result from "./Result";
import FRQResult from "./FRQResult";
import CheckboxResult from "./CheckboxResult";
import Feedback from "./Feedback";
import FRQFeedback from "./FRQFeedback";
import CheckboxFeedback from "./CheckboxFeedback";

describe("Student Components", () => {
  test("MCQ allows selecting and submitting an answer", () => {
    const mockAnswer = jest.fn();
    render(<MCQ question={{ question: "Pick one", options: ["A", "B"] }} onAnswer={mockAnswer} />);

    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("Submit"));

    expect(mockAnswer).toHaveBeenCalledWith("A");
  });

  test("FRQ allows typing and submitting an answer", () => {
    const mockSubmit = jest.fn();
    render(<FRQ question={{ question: "Type something", acceptedAnswers: ["yes"] }} onSubmit={mockSubmit} onShowAnswer={() => {}} onNext={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText("Type your answer here..."), { target: { value: "yes" } });
    fireEvent.click(screen.getByText("Submit"));

    expect(mockSubmit).toHaveBeenCalledWith("yes");
  });

  test("Checkbox allows selecting multiple options and submitting", () => {
    const mockSubmit = jest.fn();
    render(<Checkbox question={{ question: "Pick options", options: ["A", "B", "C"] }} onSubmit={mockSubmit} />);

    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("C"));
    fireEvent.click(screen.getByText("Submit"));

    expect(mockSubmit).toHaveBeenCalledWith(expect.arrayContaining(["A", "C"]));
  });

  test("Result highlights selected answer", () => {
    render(<Result question={{ question: "Pick one", options: ["A", "B"] }} userAnswer="A" onShowAnswer={() => {}} onNext={() => {}} />);

    expect(screen.getByText("A")).toHaveClass("result-selected-answer");
  });

  test("FRQResult displays user answer", () => {
    render(<FRQResult question={{ question: "Type answer", acceptedAnswers: ["yes"] }} userAnswer="my answer" onNext={() => {}} onShowAnswer={() => {}} />);

    expect(screen.getByText("my answer")).toBeInTheDocument();
  });

  test("CheckboxResult highlights selected answers", () => {
    render(<CheckboxResult question={{ question: "Pick", options: ["A", "B", "C"] }} userAnswer={["B", "C"]} onShowAnswer={() => {}} onNext={() => {}} />);

    expect(screen.getByText("B")).toHaveClass("result-selected-answer");
    expect(screen.getByText("C")).toHaveClass("result-selected-answer");
  });

  test("Feedback highlights correct and incorrect answers", () => {
    render(<Feedback question={{ question: "Pick", options: ["A", "B", "C"] }} userAnswer="A" correctAnswer="B" onNext={() => {}} />);

    expect(screen.getByText("A")).toHaveClass("incorrect-answer");
    expect(screen.getByText("B")).toHaveClass("correct-answer");
  });

  test("FRQFeedback shows correct answers if wrong", () => {
    render(<FRQFeedback question={{ type: "FRQ", question: "Name color", acceptedAnswers: ["red", "blue"] }} userAnswer="yellow" onNext={() => {}} />);

    expect(screen.getByText("yellow")).toBeInTheDocument();
    expect(screen.getByText(/Correct Answer/)).toBeInTheDocument();
    expect(screen.getByText(/red, blue/)).toBeInTheDocument();
  });

  test("CheckboxFeedback shows correct/incorrect highlighting", () => {
    render(<CheckboxFeedback question={{ question: "Pick", options: ["A", "B", "C"], answers: ["B"] }} userAnswer={["A", "B"]} onNext={() => {}} />);

    expect(screen.getByText("B")).toHaveClass("correct-answer");
    expect(screen.getByText("A")).toHaveClass("incorrect-answer");
  });
});
