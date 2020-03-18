robocopy . C:\Users\danie\Documents\repos\gitlab_task_manager_github /MIR /W:5 /XD node_modules /XD .git /XD dist /XD build /XD .vscode

$msg = git log -1 --pretty=%B
Push-Location "C:\Users\danie\Documents\repos\gitlab_task_manager_github"

  git add *
  git commit -m $msg
  git push
Pop-Location
