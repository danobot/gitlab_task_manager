import React from 'react';
import { Formik } from 'formik';
import { Input,Form, message } from 'antd';
import { editTodo } from '../api/gitlab';
const { TextArea } = Input;
const TodoForm = ({ issue, updateTodo, labels }) => (
        <Formik
            enableReinitialize={true}
        
            initialValues={issue}
            validate={values => {
                const errors = {};

                return errors;
            }}
            onSubmit={(values, { setSubmitting }) => {
                if (values !== issue) {
                    console.log("onSubmit:: ", values)

                    editTodo(issue.project_id, issue.iid, values).then(r => {
                        console.log("Submitted: ", r)
                        message.success("Todo updated.")
                        setSubmitting(false);
                        updateTodo(r)
                    }).catch(e => {
                        message.error("Cannor update todo right now.")
                        console.log(e)
                        setSubmitting(false);
                    })
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
                isSubmitting,
                /* and other goodies */
            }) => (
                    <Form onBlur={handleSubmit}>
                            <Input style={{marginBottom: '5px'}}
                                name="title"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.title} />
                            <TextArea autoSize={{ minRows: 2, maxRows: 10 }}
                                name="description"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.description} />
                       
                    </Form>
                )}
        </Formik>
);

export default TodoForm;