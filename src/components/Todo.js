import React from "react";
import { markDone, markTodo, unstarIssue, starIssue } from "../api/gitlab";
import { Skeleton, message, Row, Tag } from "antd";
import { useDrag } from "react-dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LIST_SEPARATOR } from "../config";
import {
  faCircle,
  faStar as faStarRegular
} from "@fortawesome/free-regular-svg-icons";
import {
  faStar as faStarSolid,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import { hasLabel, removeMetaLabels } from "../utils";
import UIfx from "uifx";
import tickAudio from "../assets/ding.mp3";

const Checko = ({ checked, onClick }) => {
  return (
    <div style={{ cursor: "hand", fontSize: "18pt" }}>
      {checked === "closed" && (
        <FontAwesomeIcon className="heading-color" icon={faCheckCircle} />
      )}
      {checked === "opened" && (
        <FontAwesomeIcon className="heading-color" icon={faCircle} />
      )}
      {checked === "hover" && (
        <FontAwesomeIcon className="heading-color" icon={faCircle} />
      )}
    </div>
  );
};
const Todo = ({ onUpdate, onSelect, issue, onSelectLabel }) => {
  const [{ isDragging }] = useDrag({
    item: { name: issue.id, type: "box" },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        alert(`You dropped ${item.name} into ${dropResult.name}!`);
      }
    },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  });

  const handleClick = issue => {
    if (issue && issue.state !== "closed") {
      onUpdate({ ...issue, state: "closed" });
      const beep = new UIfx(tickAudio);
      beep.play();
      markDone(issue.project_id, issue.iid)
        .then(d => {
          onUpdate(d);
          message.success(`Marked task ${issue.iid} as completed`);
        })
        .catch(e => {
          console.log(e);
          onUpdate(issue);
          message.error(`Task ${issue.iid} could not be updated`);
        });
    } else {
      onUpdate({ ...issue, state: "opened" });

      markTodo(issue.project_id, issue.iid)
        .then(d => {
          onUpdate(d);
          message.success(`Marked task ${issue.iid} as todo`);
        })
        .catch(e => {
          message.error(`Task ${issue.iid} could not be updated`);
          onUpdate(issue);
        });
    }
  };
  const starred = hasLabel(issue, "meta" + LIST_SEPARATOR + "starred");

  const handleStarClick = () => {
    console.log("Stargging issue");
    if (starred) {
      unstarIssue(issue.project_id, issue).then(i => {
        onUpdate(i);
      });
    } else {
      starIssue(issue.project_id, issue).then(i => {
        onUpdate(i);
      });
    }
  };
  let todoStyle = {
    marginLeft: "40px",
    padding: "18px 0px 18px 13px",
    position: "absolute",
    right: "32px",
    left: "5px"
  };

  if (issue.state === "closed") {
    todoStyle.textDecoration = "line-through";
    todoStyle.color = "darkgray";
  }

  return issue && !isDragging ? (
    <Row
      className="todo-row"
      style={{
        // border: "gray 2px solid",
        borderRadius: "4px",
        transition: "all 0.3s"
      }}
    >
      <div
        className="vertical-center"
        onClick={e => handleClick(issue)}
        style={{ marginLeft: "3px" }}
      >
        <Checko checked={issue.state} />
      </div>
      <div
        className="vertical-center todo-p"
        onClick={e => onSelect(issue)}
        style={todoStyle}
      >
        <p>{issue.title}</p>
        <p>
          {removeMetaLabels(issue.labels).map(l => (
            <Tag
              className="todo-labels"
              key={`${issue.iid}-${l}`}
              onClick={e => onSelectLabel(l)}
            >
              {l}
            </Tag>
          ))}
        </p>
      </div>

      <div
        onClick={e => {
          handleStarClick();
        }}
        style={{ fontSize: "12pt", float: "right" }}
      >
        {starred && <FontAwesomeIcon icon={faStarSolid} />}
        {!starred && <FontAwesomeIcon icon={faStarRegular} />}
      </div>
    </Row>
  ) : (
    <Skeleton active paragraph={{ rows: 0 }} title={{ width: 100 }} />
  );
};

export default Todo;
