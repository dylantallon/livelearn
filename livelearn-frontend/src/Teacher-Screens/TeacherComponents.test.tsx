import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Edit from "../Edit";
import Poll from "../Poll";
import Score from "../Score";
import Session from "../Session";

// Mock router context because these pages use useNavigate, useLocation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ state: { pollId: "test-poll-id" } }),
}));

// Mock firebase since you are using Firestore methods
jest.mock("../firebase", () => ({
  db: {}
}));

describe("Teacher Components", () => {
  test("Poll screen renders 'New Poll' button", () => {
    render(<Poll />);
    expect(screen.getByText(/New Poll/i)).toBeInTheDocument();
  });

  test("Edit screen renders 'Add Question' button", () => {
    render(<Edit />);
    expect(screen.getByText(/Add Question/i)).toBeInTheDocument();
  });

  test("Score screen renders loading or no scores", () => {
    render(<Score />);
    expect(screen.getByText(/Loading...|No scores available/i)).toBeInTheDocument();
  });

  test("Session screen renders session controls", () => {
    render(<Session />);
    expect(screen.getByText(/Show Answer/i)).toBeInTheDocument();
    expect(screen.getByText(/End Session/i)).toBeInTheDocument();
  });
});
