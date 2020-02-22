import React from 'react';
import { Formik } from 'formik';
import { Input, Button, Form } from 'antd';
const TodoListForm = ({ onSubmit }) => (
    <div>
        <Formik
            initialValues={{title: '', color: '#428BCA'}}
            validate={values => {
                const errors = {};

                return errors;
            }}
            onSubmit={(values, { setSubmitting }) => {
                // console.log("onSubmit:: ", values)

                onSubmit(`list::${values.name}`, values.color)
                setSubmitting(false)
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
                    <Form onSubmit={handleSubmit}>
                        <Form.Item>
                            <Input
                                name="name"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.name} />
                        </Form.Item>
                        <Form.Item>
                            <Input
                                name="color"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.color} />
                        </Form.Item>
                        <Button type="primary" size="small" onClick={handleSubmit}>Add</Button>
                    </Form>
                )}
        </Formik>
    </div>
);

export default TodoListForm;