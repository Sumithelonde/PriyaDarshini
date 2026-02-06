import React from 'react';
import { Button } from "./ui/button";

export default function QuestionSection() {
  const handleGetStarted = () => {
    window.open('http://localhost:5678/webhook/86816cfb-edb3-41c2-a959-b5c72a110eb6/chat', '_blank');
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-2xl font-bold mb-4">Ask a Question</h2>
      <p className="text-center mb-6">
        Have a question? Our AI assistant is here to help!
      </p>
      <Button onClick={handleGetStarted}>
        Get Started
      </Button>
    </div>
  );
}