import { LIST_SEPARATOR } from "./config";

export const hasLabel = (issue, label) => {
  // console.log("hasLabel issue" ,issue.labels)
  // console.log("hasLabel label" ,label)
  const val = issue.labels.filter(l => l === label).length === 1;
  // console.log("hasLabel result" ,val)
  return val;
};
export const hasNoListLabel = issue => {
  const val =
    issue.labels.filter(l => l.indexOf("list") > -1 || l.indexOf("meta") > -1)
      .length === 0;
  return val;
};
export const removeMetaLabels = labels => {
  const val = labels.filter(
    l => l.indexOf("list") === -1 && l.indexOf("meta") === -1
  );
  console.log("hasLabel result", val);

  return val;
};
export const getActualLabelName = label => {
  return label.name.split(LIST_SEPARATOR)[1];
};

export const titleCase = string => {
  var sentence = string.toLowerCase().split(" ");
  for (var i = 0; i < sentence.length; i++) {
    sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
  }
  return sentence;
};
// problem is that when adding the myday label then all othe labels are removed
