// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pager } from "../pager";
import { Field, Input } from "../input";
import { Avatar } from "../avatar";

afterEach(cleanup);

describe("Pager", () => {
  it("renders nothing interactive for a single page", () => {
    render(<Pager page={1} pageCount={1} total={3} onPage={() => undefined} />);
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.getByText("3 kayıt")).toBeInTheDocument();
  });

  it("navigates and disables the edges", () => {
    const onPage = vi.fn();
    const { rerender } = render(<Pager page={1} pageCount={3} onPage={onPage} />);
    expect(screen.getByRole("button", { name: "Önceki sayfa" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Sonraki sayfa" }));
    expect(onPage).toHaveBeenCalledWith(2);
    rerender(<Pager page={3} pageCount={3} onPage={onPage} />);
    expect(screen.getByRole("button", { name: "Sonraki sayfa" })).toBeDisabled();
  });
});

describe("Field", () => {
  it("associates the label with the control and announces errors", () => {
    render(<Field label="E-posta" htmlFor="email" error="Geçersiz"><Input id="email" /></Field>);
    expect(screen.getByLabelText("E-posta")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Geçersiz");
  });
});

describe("Avatar", () => {
  it("falls back to deterministic initials", () => {
    render(<Avatar name="ayse_tech" />);
    expect(screen.getByText("AT")).toBeInTheDocument();
  });
});
