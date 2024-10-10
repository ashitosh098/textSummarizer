"use client";

import { useState, useRef } from "react";
import styles from "./QueryForm.module.css";
import Image from "next/image";

const QueryForm: React.FC = () => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isSearched, setIssearched] = useState(false);
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
    setIssearched(true);
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
    <div className="h-screen w-full flex">
      <div className="w-[300px] min-w-[300px] bg-primary text-white">
        <h1 className="flex justify-center p-4 mb-8 border-b border-opacity-35 border-white">
          <Image
            src="/assets/images/textmaster.svg"
            alt="Text Master"
            width={224}
            height={44}
          />
        </h1>

        <div className="sidebarBlock flex-grow-1 px-6">
          <h3 className="text-white text-base font-semibold mb-2">
            Capabilities
          </h3>
          <ul className="mb-4 pl-4">
            <li className="list-disc text-sm text-white opacity-65">
              Summarization of long texts
            </li>
            <li className="list-disc text-sm text-white opacity-65">
              Translation between multiple languages
            </li>
          </ul>

          <h3 className="text-white text-base font-semibold mb-2">
            Steps to Use:
          </h3>
          <ul className="mb-4 pl-4">
            <li className="list-disc text-sm text-white opacity-65">
              For summarization, select &quot;Summarize&quot; and add the text
              you need a summary of in the input box.
            </li>
            <li className="list-disc text-sm text-white opacity-65">
              To utilize the translation feature, please select
              &quot;Translate&quot; and format your input as follows:
              <br />
              <code>
                Translate to &quot;desired language&quot;: &quot;your text to be
                translated&quot;
              </code>
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full flex flex-col items-center justify-center px-8 pb-20 pt-6">
        <form
          onSubmit={handleSubmit}
          className={`w-full ${isSearched ? "searchBottom" : ""}`}
        >
          <div className="max-w-3xl mx-auto w-full relative">
            <div className="flex justify-between px-4 mb-2">
              <label className="whitespace-pre-line break-words font-display text-xl font-regular text-primary">
                Your text Here:
              </label>
              <div className="flex">
                <div className={styles.customRadio}>
                  <input
                    type="radio"
                    value="summarize"
                    checked={actionType === "summarize"}
                    onChange={handleActionChange}
                    className="absolute opacity-0 left-0 top-0"
                    id="summarize"
                  />
                  <label
                    htmlFor="summarize"
                    className="w-full flex items-center justify-center px-3 py-1 border border-primary text-primary text-sm font-medium rounded-l-md bg-white hover:bg-secondaryShade1 hover:text-white cursor-pointer"
                  >
                    Summarize
                  </label>
                </div>
                <div className={styles.customRadio}>
                  <input
                    type="radio"
                    value="translate"
                    checked={actionType === "translate"}
                    onChange={handleActionChange}
                    className="absolute opacity-0 left-0 top-0"
                    id="translate"
                  />
                  <label
                    htmlFor="translate"
                    className="w-full flex items-center justify-center px-3 py-1 border border-primary text-primary text-sm font-medium rounded-r-md bg-white hover:bg-secondaryShade1 hover:text-white cursor-pointer"
                  >
                    Translate
                  </label>
                </div>
              </div>
            </div>

            <textarea
              ref={inputTextAreaRef}
              value={input}
              onChange={handleInputChange}
              required
              rows={10}
              className="w-full h-20 rounded-full bg-slate-200 border-[6px] border-slate-50 resize-none outline-none shadow-xs pl-6 pr-24 py-5"
            />
            <div className="flex items-center gap-3 absolute right-0 bottom-0 px-6 pb-8">
              <button
                className="w-8 h-8 rounded-full bg-slate-100 flex justify-center items-center border-none outline-none"
                type="button"
                onClick={() => {
                  setInputsList([]);
                  setTypingEffect("");
                  setError("");
                  setIssearched(false);
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 13 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.2465 1.07842V4.14005C12.2465 4.27538 12.1927 4.40517 12.0971 4.50086C12.0014 4.59656 11.8716 4.65032 11.7362 4.65032H8.67461C8.53928 4.65032 8.40949 4.59656 8.31379 4.50086C8.2181 4.40517 8.16434 4.27538 8.16434 4.14005C8.16434 4.00471 8.2181 3.87492 8.31379 3.77923C8.40949 3.68354 8.53928 3.62977 8.67461 3.62977H10.5046L9.57141 2.69662C8.62305 1.74394 7.33545 1.20647 5.99122 1.20216H5.96252C4.62955 1.19904 3.34892 1.72077 2.39764 2.65452C2.30019 2.74549 2.17101 2.79471 2.03773 2.79165C1.90446 2.7886 1.77767 2.7335 1.68449 2.63816C1.59132 2.54282 1.53916 2.4148 1.53916 2.28149C1.53917 2.14818 1.59135 2.02016 1.68453 1.92483C2.83745 0.798023 4.38821 0.171335 6.0003 0.180769C7.61238 0.190203 9.15571 0.834997 10.2954 1.97522L11.226 2.90838V1.07842C11.226 0.943087 11.2797 0.813298 11.3754 0.717603C11.4711 0.621909 11.6009 0.568148 11.7362 0.568148C11.8716 0.568148 12.0014 0.621909 12.0971 0.717603C12.1927 0.813298 12.2465 0.943087 12.2465 1.07842ZM9.84887 9.70774C8.88818 10.6462 7.59628 11.168 6.25334 11.1601C4.9104 11.1522 3.62471 10.6153 2.6751 9.66564L1.74194 8.73249H3.5719C3.70723 8.73249 3.83702 8.67873 3.93271 8.58303C4.02841 8.48734 4.08217 8.35755 4.08217 8.22222C4.08217 8.08688 4.02841 7.95709 3.93271 7.8614C3.83702 7.7657 3.70723 7.71194 3.5719 7.71194H0.510271C0.374939 7.71194 0.245149 7.7657 0.149455 7.8614C0.0537607 7.95709 0 8.08688 0 8.22222V11.2838C0 11.4192 0.0537607 11.549 0.149455 11.6447C0.245149 11.7404 0.374939 11.7941 0.510271 11.7941C0.645603 11.7941 0.775393 11.7404 0.871087 11.6447C0.966782 11.549 1.02054 11.4192 1.02054 11.2838V9.45388L1.9537 10.387C3.09174 11.5308 4.63734 12.1759 6.25082 12.1806H6.28463C7.88438 12.1848 9.42135 11.5585 10.5626 10.4374C10.6558 10.3421 10.708 10.2141 10.708 10.0808C10.708 9.94746 10.6558 9.81944 10.5627 9.7241C10.4695 9.62876 10.3427 9.57367 10.2094 9.57061C10.0761 9.56755 9.94696 9.61677 9.84951 9.70774H9.84887Z"
                    fill="#9D9D9D"
                  />
                </svg>
              </button>
              <button
                type="submit"
                className="w-8 h-8 rounded-full bg-secondary flex justify-center items-center border-none outline-none"
              >
                <svg
                  width="14"
                  height="11"
                  viewBox="0 0 18 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.7806 8.53104L11.0306 15.281C10.8899 15.4218 10.699 15.5008 10.5 15.5008C10.301 15.5008 10.1101 15.4218 9.96937 15.281C9.82864 15.1403 9.74958 14.9494 9.74958 14.7504C9.74958 14.5514 9.82864 14.3605 9.96937 14.2198L15.4397 8.75042H0.75C0.551088 8.75042 0.360322 8.6714 0.21967 8.53075C0.0790178 8.3901 0 8.19933 0 8.00042C0 7.8015 0.0790178 7.61074 0.21967 7.47009C0.360322 7.32943 0.551088 7.25042 0.75 7.25042H15.4397L9.96937 1.78104C9.82864 1.64031 9.74958 1.44944 9.74958 1.25042C9.74958 1.05139 9.82864 0.860523 9.96937 0.719792C10.1101 0.579062 10.301 0.5 10.5 0.5C10.699 0.5 10.8899 0.579062 11.0306 0.719792L17.7806 7.46979C17.8504 7.53945 17.9057 7.62216 17.9434 7.71321C17.9812 7.80426 18.0006 7.90186 18.0006 8.00042C18.0006 8.09898 17.9812 8.19657 17.9434 8.28762C17.9057 8.37867 17.8504 8.46139 17.7806 8.53104Z"
                    fill="white"
                  />
                </svg>
              </button>
            </div>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>

        {/* Displaying user inputs and their corresponding responses */}
        {inputsList.map((item, index) => (
          <div
            className="w-full h-auto"
            key={index}
            ref={index === inputsList.length - 1 ? lastResponseRef : null}
          >
            <p className="whitespace-pre-line break-words font-display text-2xl font-regular text-primary mb-4">
              {item.input}
            </p>
            <h3 className="flex gap-1 mb-3">
              <svg
                width="26"
                height="26"
                viewBox="0 0 26 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 13L15.2094 4.74641C15.4126 4.00994 15.8951 3.34965 16.6062 2.94332C18.0283 2.13066 19.8568 2.61318 20.6695 4.03533C21.0504 4.69562 21.152 5.4067 21.025 6.09238M13 13L10.7906 4.74641C10.5874 4.00994 10.689 3.19728 11.0953 2.4862C11.908 1.06404 13.7365 0.581523 15.1586 1.39418C15.7935 1.74972 16.2506 2.33382 16.4792 2.99411M13 13L4.74641 10.7906C4.00994 10.5874 3.34965 10.1049 2.94332 9.39382C2.13066 7.97166 2.61318 6.14317 4.03533 5.33051C4.67022 4.94958 5.4067 4.84799 6.09238 4.97497M13 13L4.74641 15.2094C4.00994 15.4126 3.19728 15.311 2.4862 14.9047C1.06404 14.092 0.581523 12.2635 1.39418 10.8414C1.74972 10.2065 2.33382 9.74936 2.99411 9.52079M13 13L10.7906 21.2536C10.5874 21.9901 10.1049 22.6504 9.39382 23.0567C7.97166 23.8693 6.14317 23.3868 5.33051 21.9647C4.94958 21.3298 4.84799 20.5933 4.97497 19.9076M13 13L15.2094 21.2536C15.4126 21.9901 15.311 22.8027 14.9047 23.5138C14.092 24.936 12.2635 25.4185 10.8414 24.6058C10.2065 24.2503 9.74936 23.6662 9.52079 23.0059M13 13L19.0442 19.0696C19.5775 19.6029 19.9076 20.3647 19.9076 21.1774C19.9076 22.8027 18.587 24.1487 16.9363 24.1487C16.1999 24.1487 15.5142 23.8693 14.9809 23.4122M13 13L21.2536 15.2094C21.9901 15.4126 22.6504 15.8951 23.0567 16.6062C23.8693 18.0283 23.3868 19.8568 21.9647 20.6695C21.3298 21.0504 20.5933 21.152 19.9076 21.025M13 13L21.2536 10.7906C21.9901 10.5874 22.8027 10.689 23.5138 11.0953C24.936 11.908 25.4185 13.7365 24.6058 15.1586C24.2503 15.7935 23.6662 16.2506 23.0059 16.4792M13 13L19.0696 6.95583C19.6029 6.42252 20.3647 6.09238 21.1774 6.09238C22.8027 6.09238 24.1487 7.41296 24.1487 9.06367C24.1487 9.80015 23.8693 10.4858 23.4122 11.0191M13 13L6.95583 6.95583C6.42252 6.42252 6.09238 5.66065 6.09238 4.84799C6.09238 3.22267 7.41296 1.8767 9.06367 1.8767C9.80015 1.8767 10.4858 2.15605 11.0191 2.61318C10.7652 2.43541 10.435 2.33382 10.1049 2.33382C9.21605 2.33382 8.47957 3.0703 8.47957 3.95915C8.47957 4.41627 8.65734 4.8226 8.96209 5.10195L11.6286 7.76849M6.09238 5.00037C5.78763 4.97497 5.45749 5.05116 5.15274 5.20353C4.39087 5.66065 4.11152 6.65109 4.56864 7.41296C4.7972 7.79389 5.15274 8.04785 5.55907 8.17482L9.19065 9.13986M11.0191 2.58778C10.4858 2.13066 9.80015 1.85131 9.06367 1.85131C7.41296 1.85131 6.09238 3.19728 6.09238 4.8226C6.09238 5.63526 6.42252 6.39713 6.95583 6.93044L13 12.9746M3.01951 9.54619C2.74015 9.67317 2.4862 9.90173 2.30843 10.2065C1.85131 10.9683 2.13066 11.9588 2.89253 12.4159C3.27346 12.6445 3.73058 12.6953 4.11152 12.5683L7.7431 11.6032M2.61318 14.9809C2.43541 15.2348 2.33382 15.565 2.33382 15.8951C2.33382 16.784 3.0703 17.5204 3.95915 17.5204C4.41627 17.5204 4.8226 17.3427 5.10195 17.0379L7.76849 14.3714M5.00037 19.9076C4.97497 20.2124 5.05116 20.5425 5.20353 20.8473C5.66065 21.6091 6.65109 21.8885 7.41296 21.4314C7.79389 21.2028 8.04785 20.8473 8.17482 20.4409L9.13986 16.8093M2.58778 14.9809C2.13066 15.5142 1.85131 16.1999 1.85131 16.9363C1.85131 18.587 3.19728 19.9076 4.8226 19.9076C5.63526 19.9076 6.39713 19.5775 6.93044 19.0442L12.9746 13M9.54619 22.9805C9.67317 23.2598 9.90173 23.5138 10.2065 23.6916C10.9683 24.1487 11.9588 23.8693 12.4159 23.1075C12.6445 22.7265 12.6953 22.2694 12.5683 21.8885L11.6032 18.2569M14.9809 23.3868C15.2348 23.5646 15.565 23.6662 15.8951 23.6662C16.784 23.6662 17.5204 22.9297 17.5204 22.0409C17.5204 21.5837 17.3427 21.1774 17.0379 20.8981L14.3968 18.2315M19.9076 20.9996C20.2124 21.025 20.5425 20.9488 20.8473 20.7965C21.6091 20.3393 21.8885 19.3489 21.4314 18.587C21.2028 18.2061 20.8473 17.9522 20.4409 17.8252L16.8093 16.8601M22.9805 16.4538C23.2598 16.3268 23.5138 16.0983 23.6916 15.7935C24.1487 15.0317 23.8693 14.0412 23.1075 13.5841C22.7265 13.3555 22.2694 13.3047 21.8885 13.4317L18.2569 14.3968M23.3868 11.0191C23.5646 10.7652 23.6662 10.435 23.6662 10.1049C23.6662 9.21605 22.9297 8.47957 22.0409 8.47957C21.5837 8.47957 21.1774 8.65734 20.8981 8.96209L18.2315 11.6032M20.9996 6.09238C21.025 5.78763 20.9488 5.45749 20.7965 5.15274C20.3393 4.39087 19.3489 4.11152 18.587 4.56864C18.2061 4.7972 17.9522 5.15274 17.8252 5.55907L16.8601 9.19065M16.4538 3.01951C16.3268 2.74015 16.0983 2.4862 15.7935 2.30843C15.0317 1.85131 14.0412 2.13066 13.5841 2.89253C13.3555 3.27346 13.3047 3.73058 13.4317 4.11152L14.3968 7.7431"
                  stroke="#4BE479"
                  stroke-miterlimit="10"
                />
              </svg>
              <span className="whitespace-pre-line break-words font-display text-xl font-regular text-primary">
                Answer
              </span>
            </h3>
            <label>
              <textarea
                value={
                  index === inputsList.length - 1
                    ? typingEffect // Show typing effect for latest response being typed out
                    : item.response || "" // Show final response or empty if not yet available
                }
                readOnly
                rows={5} // Start with five rows
                className="border-none w-full h-auto outline-none shadow-none" // Use the imported style
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueryForm;
