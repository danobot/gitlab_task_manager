import { ProjectsBundle } from 'gitlab';
import {GITLAB_HOST, GITLAB_TOKEN, LABEL_STARRED, LABEL_MYDAY } from '../config.js'
export const gitlab = new ProjectsBundle({
  host:   GITLAB_HOST,
  token: GITLAB_TOKEN,
});


export async function markDone(project, issue) {
  return gitlab.Issues.edit(project,issue, { state_event: 'close'})
}
export async function markTodo(project, issue) {
  return gitlab.Issues.edit(project,issue, { state_event: 'reopen'})
}

export async function editTodo(project, issue, data) {
  return gitlab.Issues.edit(project,issue, data)
}
export async function addComment(project, issue, data) {
  return gitlab.IssueNotes.create(project,issue, data)
}
export async function getComments(project, issue) {
  console.log("Getting comments for : issue: " + issue + " on project " + project)
  return gitlab.IssueNotes.all(project,issue) // issue id somehow incorrect
}
export async function createIssue(project, data) {
  return gitlab.Issues.create(project,data)
}
export async function starIssue(project, issue) {
  console.log("starIssue" , issue)
  return addLabel(project, issue, LABEL_STARRED)
}
export async function unstarIssue(project, issue) {
  console.log("unstarIssue" , issue)
  return removeLabel(project, issue,  LABEL_STARRED)
}
export async function getWallpaper() {
  console.log("getWallpaper")
  return fetch("https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-AU",
  {
    host: 'www.bing.com',
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    mode: 'no-cors', // no-cors, , same-origin
    credentials: 'include', // include, *same-origin, omit
    accept: '*/*',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *client
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36'
  }).then(r=> {
    console.log("Wallpaper response: ", r)
  })
}

export async function addIssueToMyDay(project, issue) {
  console.log("addIssueToMyDay", issue)
  return addLabel(project, issue, LABEL_MYDAY)
}
export async function removeIssueFromMyDay(project, issue) {
  console.log("removeIssueFromMyDay", issue)

  return removeLabel(project, issue,  LABEL_MYDAY)
}

export async function addLabel(project, issue, label) {
  // console.log("addLabel() issue: ", issue)
  let c = issue.labels;
  // console.log("addLabel() original labels: ", issue.labels)
  c.push(label);
  // console.log("addLabel() new labels: ", c)
  return gitlab.Issues.edit(project, issue.iid, {labels: c})
}
export async function removeLabel(project, issue,  label) {
  console.log("issue.labels.indexOf(label)", issue.labels.indexOf(label))
  let temp = issue.labels
  const splicedPart = temp.splice(temp.indexOf(label),1)
  console.log("afterSplice",temp)
    return gitlab.Issues.edit(project, issue.iid, {labels: temp})
}
// this.state.issue is not updated when the label is added or removed
// when you reselect the same issue, then the side pane is updated