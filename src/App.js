import React from "react";
import "./App.scss";
import "./custom.scss";
// import "./theme.scss";
import { Layout, Menu, Popover, message, Divider } from "antd";

import TodoList from "./components/TodoList";
import { gitlab } from "./api/gitlab";
import TodoListForm from "./components/TodoListForm";
import { LIST_SEPARATOR, PROJECT_ID } from "./config";
import DropMenuItem from "./components/DropMenuItem";
import { faSquare } from "@fortawesome/free-solid-svg-icons";
import { faPlusSquare } from "@fortawesome/free-regular-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getActualLabelName, hasLabel, hasNoListLabel } from "./utils";

const { Content, Sider } = Layout;

class App extends React.Component {
  state = {
    accounts: [],
    addListVisible: false,
    allIssues: []
  };
  componentDidMount = () => {
    // Get all labels
    let localLabels = JSON.parse(localStorage.getItem("labels"));
    console.log("Using local labels", localLabels);
    if (localLabels != null && localLabels.length > 0) {
      console.log("Using local labels", localLabels);
      console.log("Using local labels", localLabels[0]);

      this.setState({
        ...this.state,
        label: localLabels[0],
        labels: localLabels
      });
    } else {
      if (!this.state.labels ) {
        gitlab.Labels.all(PROJECT_ID).then(labels => {
          const filteredLabels = labels.filter(
            l => l.name.indexOf("list" + LIST_SEPARATOR) === 0
          );
          console.log("Labels received: ", filteredLabels);
          localStorage.setItem("labels", JSON.stringify(filteredLabels));
          this.setState({ ...this.state, labels: filteredLabels, label: filteredLabels[0] });
        });
      }
    }

    // get al Tasks
    let localTodos = JSON.parse(localStorage.getItem("allIssues"));
    console.log("localTodos: ", localTodos);
    if (localTodos != null && localTodos.length > 0) {
      console.log("Using local Todods");
      this.setState({
        ...this.state,
        allIssues: localTodos.sort((a, b) => a.id - b.id)
          // .filter(i => hasLabel(i, this.state.label.name))
      });
    } else {
      if (this.state.allIssues.length === 0) {
        console.log("State issues.length is 0");
        this.updateTodos(this.state.label);
      }
    } // when you remove from my day the issue loses all labels except my day.
  };
  componentDidUpdate = () => {};
  createList = (name, color) => {
    console.log("createList ", name);
    gitlab.Labels.create(PROJECT_ID, name, color).then(e => {
      console.log(e);
      this.state.labels.push(e);
      message.success("Todo list created");
      this.hide();
      this.setState({ ...this.state, labels: this.state.labels, label: e });
    });
  };
  hide = () => {
    this.setState({
      addListVisible: false
    });
  };
  updateTodos = () => {
    console.log("Update tasks from Gitlab");
    this.setState({ ...this.state, allIssues: [], list: null });

    gitlab.Issues.all({ projectId: PROJECT_ID }).then(e => {
      const sortedTasks = e.filter(i=> i.state !== "closed").sort((a, b) => a.id - b.id)
      console.log("Received tasks frrom Gitlab", sortedTasks);
      localStorage.setItem("allIssues", JSON.stringify(sortedTasks));
      this.setState({ ...this.state, allIssues: sortedTasks});
    });
  };
  updateTodo = issue => {
    console.log("updtaeTood: ", issue);
    console.log("issues before update: ", this.state.allIssues);
    let issues = this.state.allIssues.filter(i => i.id !== issue.id);
    issues.push(issue);
    console.log("after update: ", issues);

    this.setState({
      ...this.state,
      allIssues: issues.sort((a, b) => a.id - b.id)
    });
  };
  handleVisibleChange = () => {
    this.setState({ addListVisible: !this.state.addListVisible });
  };
  // if (this.state.accounts.length === 0) {
  //   Account.findAll(result => {
  //     console.log(result)
  //     this.setState({
  //       accounts: result.slice(0, MATCHING_ITEM_LIMIT)
  //     });
  //   });
  // }
  onSetSidebarOpen = open => {
    this.setState({ sidebarOpen: open });
  };


  render() {
    return (
      <Layout theme="dark">
        <Layout  theme="dark">
          <Sider
            width={250}
            style={{ background: "$base-color", sidebar: { zIndex: 0 } }}
          >
            <Menu 
            theme="dark"
              mode="inline"
              defaultSelectedKeys={["1"]}
              defaultOpenKeys={["accounts", "todolists"]}
              style={{ height: "100%", borderRight: 0 }}
            >
              <DropMenuItem
                onClick={e => {
                  this.setState({ label: { name: "meta::myday", title: "My Day" } });
                }}
                key={"meta::myday"}
                label="My Day"
                title="My Day"
              />
              <DropMenuItem
                onClick={e => {
                  this.setState({ label: {name: "ALL", title: "My Tasks"}});
                }}
                key="mytasks"
                label="My Tasks"
                title="My Tasks"
              />
              <DropMenuItem
                onClick={e => {
                  this.setState({ label: { name: "meta::starred", title: "Important Tasks" } });
                }}
                key={"meta::starred"}
                label="Important"
                title="Important"
              />
                   <Divider />
             
            
                { this.state.labels &&
                  this.state.labels.map(l => (
                    <DropMenuItem
                      onClick={e => this.setState({ label: l })}
                      key={l.id}
                      label={getActualLabelName(l)}
                      icon={<FontAwesomeIcon icon={faSquare} color={l.color} size="lg" />}
                    />
                  ))}
               <span>
                    <Popover
                      content={<TodoListForm onSubmit={this.createList} />}
                      visible={this.state.addListVisible}
                      onVisibleChange={this.handleVisibleChange}
                      title="Add List"
                      trigger="click"
                    >
                        
                      <FontAwesomeIcon icon={faPlusSquare} className="heading-color" style={{ float: "right", cursor: 'hand', marginRight: '17px' }} size="lg" onClick={e => this.handleVisibleChange()}/>
                    </Popover>
                  </span>
            </Menu>
          </Sider>

          <Layout style={{ padding: "0", minHeight: "100%" }}>
            <Content
              style={{
                padding: 10,
                margin: 0
              }}
            >
              {this.state.label && (
                <TodoList key={this.state.label.id} label={this.state.label} title={this.state.label.title ? this.state.label.title : getActualLabelName(this.state.label)}
                updateTodo={this.updateTodo}
                updateTodos={this.updateTodos}
                  issues={
                    this.state.allIssues.filter(i => {
                      if (this.state.label.name === "ALL") {
                        return hasNoListLabel(i)
                      } else {
                        return hasLabel(i, this.state.label.name)
                      }
                      }).sort((a, b) => a.id - b.id)
                } 
                onSelectLabel={
                  label => this.setState({label: {name: label, title: label}})
                } />
              )}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    );
  }
}

export default App;
