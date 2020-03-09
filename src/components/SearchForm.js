import React from 'react';
import { Formik } from 'formik';
import { Input, Button, Form, Col, Row } from 'antd';
const SearchForm = ({ onSubmit }) => (
    <div>
        <Formik
            initialValues={{search: ''}}
            onSubmit={(values, { setSubmitting }) => {
                onSubmit(values)
                setSubmitting(false)
            }}
            onChange={c=> {
                onSubmit(c)
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
            }) => (
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col span={24}>
                            <Input
                                name="search"
                                placeholder="Search"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                 />
                            </Col>
                          
                        </Row>
                       
                        
                    </Form>
                )}
        </Formik>
    </div>
);

export default SearchForm;