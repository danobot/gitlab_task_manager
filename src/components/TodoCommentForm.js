import React from "react";
import { Formik } from "formik";
import { Input, Form, message, Button } from "antd";
import { addComment } from "../api/gitlab";
const { TextArea } = Input;
const TodoCommentForm = ({ issue, addCommentCb }) => (
  <div>
    <Formik
      initialValues={issue}
      onSubmit={(values, { setSubmitting }) => {
        if (values !== issue) {
          const comment = values.comment;
          values.comment = "";
          addComment(issue.project_id, issue.iid, comment)
            .then(r => {
              addCommentCb(r);
              setSubmitting(false);
            })
            .catch(e => {
              message.error("Cannor add comment right now.");
              console.log(e);
              setSubmitting(false);
            });
        }
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting
        /* and other goodies */
      }) => (
        <Form onSubmit={handleSubmit}>
          <Form.Item>
            <TextArea
              rows={4}
              placeholder="Add a comment"
              style={{ padding: "7px 10px 5px 10px" }}
              name="comment"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.comment}
            />
          </Form.Item>

          <Button
            type="primary"
            size="small"
            style={{ float: "right" }}
            onClick={handleSubmit}
          >
            Save
          </Button>
        </Form>
      )}
    </Formik>
  </div>
);

export default TodoCommentForm;
