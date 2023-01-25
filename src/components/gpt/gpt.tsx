import React, { useEffect } from "react";
import {
  TextArea,
  Button,
  ControlGroup,
  Icon,
  Intent,
} from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";

import "./gpt.css";

const INPUT_TOO_LONG_MSG =
  "Input is too long. Please shorten it to 150 characters or less.";
const INPUT_TOO_SHORT_MSG =
  "Input is too short. Please lengthen it to 10 characters or more.";

const INPUT_LOWER_LIMIT = 10;
const INPUT_UPPER_LIMIT = 150;

const GPT_URL = "REMOVED";

const Gpt = () => {
  const [generatorText, setGeneratorText] = React.useState("");
  const [generatorError, setGeneratorError] = React.useState("");
  const [generatedRegex, setGeneratedRegex] = React.useState("");
  const [generatorLoading, setGeneratorLoading] = React.useState(false);

  const [descriptionText, setDescriptionText] = React.useState("");
  const [descriptionError, setDescriptionError] = React.useState("");
  const [descriptionLoading, setDescriptionLoading] = React.useState(false);
  const [generatedDescription, setGeneratedDescription] = React.useState("");

  const checkInput = (isGenerator: boolean, text: string) => {
    if (text.length < INPUT_LOWER_LIMIT) {
      isGenerator
        ? setGeneratorError(INPUT_TOO_SHORT_MSG)
        : setDescriptionError(INPUT_TOO_SHORT_MSG);
    } else if (generatorText.length > INPUT_UPPER_LIMIT) {
      isGenerator
        ? setGeneratorError(INPUT_TOO_LONG_MSG)
        : setDescriptionError(INPUT_TOO_LONG_MSG);
    } else {
      if (isGenerator) {
        setGeneratorError("");
        setGeneratedRegex("");

        setGeneratorLoading(true);
        fetch(`${GPT_URL}/text-to-regex`, {
          method: "POST",
          body: JSON.stringify({
            prompt: text,
          }),
        })
          .then((res) => {
            if (res.status === 200) {
              return res.json();
            } else {
              setGeneratorError("No text generated");
              return null;
            }
          })
          .then((body) => {
            if (body) {
              setGeneratedRegex(body.text);
            }
            setGeneratorLoading(false);
          });
      } else {
        setDescriptionError("");
        setGeneratedDescription("");
        setDescriptionLoading(true);
        fetch(`${GPT_URL}/regex-to-text`, {
          method: "POST",
          body: JSON.stringify({
            prompt: text,
          }),
        })
          .then((res) => {
            if (res.status === 200) {
              return res.json();
            } else {
              setDescriptionError("No text generated");
              return null;
            }
          })
          .then((body) => {
            if (body) {
              setGeneratedDescription(body.text);
            }
            setDescriptionLoading(false);
          });
      }
    }
  };

  return (
    <div className="gpt-page-wrapper">
      <div className="gpt-content-wrapper">
        <div className="gpt-content-group">
          <h1>NOTICE:</h1>
          <p>
            This page needed to be disabled as I&apos;m not entirely sure it
            complies with OpenAI&apos;s terms of service. I have contacted them
            for clarification but I will try to get it back up and running as
            soon as possible. In the meantime, if you want to try it out, you
            can email me at{" "}
            <a href="mailto:pottertom665@gmail.com">pottertom665@gmail.com</a>{" "}
            and I will endeavour to get back to you as soon as possible.
          </p>
          <br />
          <br />
          <h2>RegEx to description</h2>
          <p>Enter a valid RegEx in the box below.</p>
          <p>
            <Tooltip2 content="Valid RegEx must be between 10 and 150 characters in length. It should be able to handle a very complex RegEx.">
              <Icon intent={Intent.PRIMARY} icon="info-sign" size={16} />
            </Tooltip2>
          </p>
          <ControlGroup>
            <TextArea
              disabled={true}
              className="gpt-textarea"
              fill={true}
              onChange={(event) => setDescriptionText(event.target.value)}
            />
            <Button
              disabled={true}
              className="gpt-button"
              intent="primary"
              large={true}
              onClick={() => checkInput(false, descriptionText)}
            >
              Describe
            </Button>
          </ControlGroup>
          {!!descriptionLoading && <p>Loading...</p>}
          {!!descriptionError && (
            <p className="gpt-error">{descriptionError}</p>
          )}
          {!!generatedDescription && (
            <p className="gpt-generated-text">{generatedDescription}</p>
          )}
        </div>
        <div className="gpt-content-group">
          <h2>Text to RegEx</h2>
          <p>Describe a RegEx in the box below.</p>
          <p>
            <Tooltip2 content="Valid description must be between 10 and 150 characters in length. Try and be as descriptive as possible.">
              <Icon intent={Intent.PRIMARY} icon="info-sign" size={16} />
            </Tooltip2>
          </p>
          <ControlGroup>
            <TextArea
              disabled={true}
              className="gpt-textarea"
              fill={true}
              onChange={(event) => setGeneratorText(event.target.value)}
            />
            <Button
              disabled={true}
              className="gpt-button"
              intent="primary"
              large={true}
              onClick={() => checkInput(true, generatorText)}
            >
              Generate
            </Button>
          </ControlGroup>
          {!!generatorLoading && <p>Loading...</p>}
          {!!generatorError && <p className="gpt-error">{generatorError}</p>}
          {!!generatedRegex && (
            <p className="gpt-generated-text">{generatedRegex}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gpt;
