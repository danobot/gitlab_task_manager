import { LIST_SEPARATOR } from "./config";
const ignoredLabels = ["ALL", "meta::archived"];

export const hasLabel = (issue, label) => {
  // console.log("hasLabel issue" ,issue.labels)
  // console.log("hasLabel label" ,label)
  const val = issue.labels.filter(l => l === label).length === 1;
  // console.log("hasLabel result" ,val)
  return val;
};

export const filterExcluded = issues => {
  return issues.filter(i => !i.labels.some(r=> ignoredLabels.indexOf(r) >= 0))
}
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
export const extractLabels = (title, list) => {
  const regex = /\#(\w*)/gm;
  let m;
  let labels = [];
  if (ignoredLabels.indexOf(list) === -1) {
    labels.push(list);
  }
  while ((m = regex.exec(title)) !== null) {
    console.log(m);
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    m.forEach((match, groupIndex) => {
      console.log(`Found match, group ${groupIndex}: ${match}`);
      if (groupIndex > 0) {
        labels.push(match);
        title = title.replace(' #' + match, '');
      }
    });
  }
  return { title, labels };
}