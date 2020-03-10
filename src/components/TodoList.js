import React from "react";
import {
  getComments,
  createIssue,
  addIssueToMyDay,
  removeIssueFromMyDay
} from "../api/gitlab";
import {extractLabels} from '../utils'
import Todo from "./Todo";
import { PROJECT_ID, LABEL_MYDAY } from "../config";
import { Formik } from "formik";
import {
  List,
  Button,
  Card,
  message,
  PageHeader,
  Row,
  Timeline,
  Typography,
  Input,
  Form,
  Col
} from "antd";
import Moment from "react-moment";
import TodoForm from "./TodoForm";
import TodoCommentForm from "./TodoCommentForm";
import { Scrollbars } from "react-custom-scrollbars";
import {
  faSyncAlt,
  faTrashAlt,
  faSun
} from "@fortawesome/free-solid-svg-icons";
import { faSun as faSunOutline } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { hasLabel } from "../utils";

const { Title } = Typography;
class TodoList extends React.Component {
  state = {
    comments: -1,
    visible: false
  };
  componentDidMount = () => {
    console.log("List to display: ", this.props.title);
  };

  addCommentCb = comment => {
    let c = this.state.comments;
    c.push(comment);
    this.setState({ ...this.state, comments: c });
  };
  onClose = () => {
    this.setState({
      visible: false
    });
  };
  onSelection = issue => {
    getComments(issue.project_id, issue.iid)
      .then(r => {
        this.setState({
          ...this.state,
          issue: issue,
          visible: true,
          comments: r
        });
      })
      .catch(e => {
        console.log("That issue does not have comments yet.");
        this.setState({ ...this.state, issue: issue, comments: [] });
      });
  };
  addIssue = () => {
    this.setState({ addIssueModal: true });
  };
  clickAddToMyDayButton = () => {
    // this.props.updateTodo()
    const todo = this.state.issue;
    // console.log(
    //   "hasLabel(this.state.issue, LABEL_MYDAY)",
    //   hasLabel(this.state.issue, LABEL_MYDAY)
    // );
    // console.log("hasLabel() issue", this.state.issue.labels);
    if (hasLabel(this.state.issue, LABEL_MYDAY)) {
      // this part works with state up date
      removeIssueFromMyDay(this.state.issue.project_id, this.state.issue)
        .then(r => {
          // message.success("Removed from My Day");
          this.props.updateTodo(r);
        })
        .catch(e => {
          this.props.updateTodo(todo);
          // message.error("Can't remove todo from My Day right now.");
          console.log(e);
        });
    } else {
      // when this runs, the state is not updated
      addIssueToMyDay(this.state.issue.project_id, this.state.issue)
        .then(r => {
          message.success("Added to My Day");
          this.props.updateTodo(r);
        })
        .catch(e => {
          this.props.updateTodo(todo);
          message.error("Can't add todo to My Day right now.");
          console.log(e);
        });
    }
  };
  render() {
    return (
      <div style={{ display: "flex", flexFlow: "column", height: "100%" }}>
        <PageHeader
          style={{ height: "100px" }}
          title={
            <Title className="heading-color" level={2}>
              {this.props.title ? this.props.title : "Untitled"}
            </Title>
          }
          extra={[
            <Button onClick={e => this.props.updateTodos()} key="2">
              <FontAwesomeIcon icon={faSyncAlt} />
            </Button>
          ]}
          // breadcrumb={{ route's }}
        ></PageHeader>
        <Row style={{ flexGrow: 1 }}>
          <Col span={this.state.visible ? 14 : 24} style={{ height: "100%" }}>
            <Scrollbars autoHide style={{ flexGrow: 1 }}>
              {this.props.issues.length > 0 ? (
                <List
                  theme="dark"
                  style={{ marginBottom: "60px" }}
                  size="small"
                  rowKey="id"
                  dataSource={this.props.issues}
                  renderItem={item => (
                    <Todo
                      issue={item}
                      onSelect={e => this.onSelection(item)}
                      onSelectLabel={this.props.onSelectLabel}
                      onUpdate={this.props.updateTodo}
                    />
                  )}
                />
              ) : (
                <div
                  className="vertical-center"
                  style={{ textAlign: "center" }}
              >{this.props.empty ? this.props.empty : ''}</div>
              )}
            </Scrollbars>
            { this.props.label &&
            <Formik
              initialValues={{ title: "" }}
              onSubmit={(values, { setSubmitting }) => {
                console.log(values)
                let title = (' ' + values.title).slice(1);
                
                const data = extractLabels(title, this.props.label.name);
                console.log(data)
                values.title = "";

                createIssue(PROJECT_ID, data).then(
                  i => {
                    var issues = this.props.issues;
                    issues.push(i);
                    this.setState({ issues: issues });
                    message.success("Todo created");
                    setSubmitting(false);
                  }
                );
              }}
            >
              {({
                values,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting
              }) => (
                <Form
                  onSubmit={handleSubmit}
                  style={{
                    flexGrow: 1,
                    position: "absolute",
                    bottom: "57px",
                    left: 0,
                    right: 0
                  }}
                >
                  <Input
                    style={{
                      flexGrow: 1,
                      border: "unset",
                      position: "absolute",
                      left: "0",
                      right: "0",
                      height: "50px",
                      bottom: "-52px",
                      margin: "10px 16px 7px 16px",
                      width: "calc(100% - 29px)",
                      background: "$base-color-lifted"
                      // padding: 0,
                    }}
                    className="todo-row todo-add"
                    size="large"
                    name="title"
                    onChange={handleChange}
                    placeholder="Add a task"
                    onBlur={handleBlur}
                    value={values.title}
                  />
                </Form>
              )}
            </Formik>
            }
          </Col>
          <Col
            span={this.state.visible ? 10 : 0}
            className="sidebar"
            style={{ height: "100%" }}
          >
            <Scrollbars autoHide style={{ flexGrow: 1 }}>
              {this.state.issue && (
                <Card theme="dark" bordered={false} style={{ padding: 0 }} className="sidebar-right">
                  <PageHeader
                    style={{ padding: 0, margin: "0 0 20px 0" }}
                    title={this.state.issue.title}
                    subTitle={`#${this.state.issue.iid}`}
                    extra={[
                      <Button
                        key="addToMyDay"
                        type="secondary"
                        onClick={e => this.clickAddToMyDayButton()}
                      >
                        {hasLabel(this.state.issue, LABEL_MYDAY) ? (
                          <FontAwesomeIcon icon={faSun} />
                        ) : (
                          <FontAwesomeIcon icon={faSunOutline} />
                        )}
                      </Button>
                    ]}
                  />

                  <TodoForm
                    issue={this.state.issue}
                    updateTodo={t => this.setState({ ...this.state, issue: t })}
                  />
                  {/* <Descriptions title="Meta" layout="vertical" column={1}>
               
                    {this.state.issue.updated_at && (
                      <Descriptions.Item label="Updated">
                        <Moment format="DD/MM/YYYY hh:mm">
                          {this.state.issue.updated_at}
                        </Moment>
                      </Descriptions.Item>
                    )}
                    {this.state.issue.closed_at && (
                      <Descriptions.Item label="Closed">
                        <Moment format="DD/MM/YYYY hh:mm">
                          {this.state.issue.closed_at}
                        </Moment>
                      </Descriptions.Item>
                    )}
                  </Descriptions> */}
                  <h1>Comments</h1>
                  <Timeline>
                    {this.state.comments.length > 0 ? (
                      this.state.comments
                        .sort((a, b) => a.id - b.id)
                        .map(c => (
                          <Timeline.Item key={`comment-${c.id}`}>
                            {c.body}
                            <Moment
                              className="text-muted"
                              style={{ float: "right" }}
                              fromNow
                              format="MMM D"
                            >
                              {c.created_at}
                            </Moment>
                          </Timeline.Item>
                        ))
                    ) : <p>No notes yet</p>}
                  </Timeline>
                  <TodoCommentForm style={{marginBottom: '20px'}}
                    issue={this.state.issue}
                    addCommentCb={this.addCommentCb}
                  />
                    {this.state.issue && (
                    <div className="detail-footer text-muted">
                        <Moment style={{paddingTop: '10px'}} className=" text-muted " format="MMM D, YYYY hh:mm a">
                          {this.state.issue.created_at}
                        </Moment>

                          
                        <Button
                          style={{ position: "fixed", "right": '27px',bottom: '5px', border: "none" }}
                          onClick={e => console.log("Delete")}
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </Button>

                    </div>
                  )}
                </Card>
              )}
            
            </Scrollbars>
           
          </Col>
          {/* <Col span={this.state.visible ? 18 : 24} style={{ height: "100%" }}>


          </Col> */}
        </Row>
      </div>
    );
  }

  
}

export default TodoList;
