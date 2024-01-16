import React from "react";

type ButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
};

function Button({ onClick, children }: ButtonProps) {
  return (
    <button
      className="bg-[#27265C] hover:bg-[#15135C] px-8 py-4 rounded-full text-white"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
