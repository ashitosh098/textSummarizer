"use client";

import { useState, useRef } from "react";
import styles from "./QueryForm.module.css";

const QueryForm: React.FC = () => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [typingEffect, setTypingEffect] = useState("");
  const [actionType, setActionType] = useState("summarize"); // Default action
  const [inputsList, setInputsList] = useState<
    { input: string; response: string }[]
  >([]); // List of inputs and responses

  const inputTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const lastResponseRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleActionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActionType(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input) return; // Prevent submission if input is empty

    // Add current input to the list
    const newInput = { input, response: "" };
    setInputsList((prev) => [...prev, newInput]);
    setTypingEffect(""); // Clear previous typing effect

    try {
      const res = await fetch("/api/huggingface", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                actionType === "translate"
                  ? "You are a translator. Please translate the following text without generating any extra content."
                  : "You are a text summarizer. Please summarize the following text without generating any extra content.",
            },
            { role: "user", content: input },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await res.json();
      simulateTyping(result.response);
      setInputsList((prev) => {
        const updatedList = [...prev];
        updatedList[updatedList.length - 1].response = result.response;
        return updatedList;
      });
      if (lastResponseRef.current) {
        lastResponseRef.current.scrollIntoView({ behavior: "smooth" });
      }
      setError(""); // Clear any previous errors
    } catch (error) {
      console.error("Error:", error);
      setError("We are facing some issues, please try again later");
    }

    // Clear input after submission
    setInput("");
  };

  // Simulate typing effect for the latest response
  const simulateTyping = (text: string) => {
    let index = 0;
    let typedText = "";

    const typingInterval = setInterval(() => {
      if (index < text.length) {
        typedText += text.charAt(index);
        setTypingEffect(typedText);
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 10); // Adjust typing speed here
  };

  return (
    <div className={styles.container}>
      <div className={styles.capabilities}>
        <h2>TextMaster.ai</h2>
        <h3>Capabilities</h3>
        <ul>
          <li>Summarization of long texts</li>
          <li>Translation between multiple languages</li>
        </ul>

        <h3>Steps to Use:</h3>
        <ol>
          <li>
            For summarization, select "Summarize" and add the text you need a
            summary of in the input box.
          </li>
          <li>
            To utilize the translation feature, please select "Translate" and
            format your input as follows:
            <br />
            <code>
              Translate to "desired language": "your text to be translated"
            </code>
          </li>
        </ol>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label>
              Your text Here:
              <textarea
                ref={inputTextAreaRef}
                value={input}
                onChange={handleInputChange}
                required
                rows={10}
                className={styles.inputTextArea}
              />
            </label>
          </div>

          <div className={styles.radioGroup}>
            <label>
              <input
                type="radio"
                value="summarize"
                checked={actionType === "summarize"}
                onChange={handleActionChange}
              />
              Summarize
            </label>
            <label>
              <input
                type="radio"
                value="translate"
                checked={actionType === "translate"}
                onChange={handleActionChange}
              />
              Translate
            </label>
          </div>

          <button type="submit">Submit</button>
          {/* Clear All Button */}
          <button
            type="button"
            onClick={() => {
              setInputsList([]);
              setTypingEffect("");
              setError("");
            }}
            className={styles.clearButton}
          >
            Clear All
          </button>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>

        {/* Displaying user inputs and their corresponding responses */}
        {inputsList.map((item, index) => (
          <div
            key={index}
            className={styles.inputResponsePair}
            ref={index === inputsList.length - 1 ? lastResponseRef : null}
          >
            <p>{item.input}</p>
            <label>
              <textarea
                value={
                  index === inputsList.length - 1
                    ? typingEffect // Show typing effect for latest response being typed out
                    : item.response || "" // Show final response or empty if not yet available
                }
                readOnly
                rows={5} // Start with five rows
                className={`${styles.responseTextArea}`} // Use the imported style
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueryForm;
