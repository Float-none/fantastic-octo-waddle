const flaggedUsers = [1663882102141, 1663900040545, 1664485938220];
import constants from "../node/constants.js";
// 创建左边展示图片
export function createRow(container, studentName, samples, chartInstance) {
  const row = document.createElement("div");
  row.classList.add("row");
  container.appendChild(row);

  const rowLabel = document.createElement("div");
  rowLabel.innerHTML = studentName;
  rowLabel.classList.add("rowLabel");
  row.appendChild(rowLabel);

  for (let sample of samples) {
    const { id, label, student_id } = sample;

    const sampleContainer = document.createElement("div");

    sampleContainer.onclick = () => handleClick(sample, false, chartInstance);

    sampleContainer.id = "sample_" + id;
    sampleContainer.classList.add("sampleContainer");

    const sampleLabel = document.createElement("div");
    sampleLabel.innerHTML = label;

    if (label !== "?") {
      sampleContainer.style.backgroundColor = "lightgreen";
    }

    sampleContainer.appendChild(sampleLabel);

    const img = document.createElement("img");
    img.setAttribute("loading", "lazy");
    // img.src = constants.IMG_DIR + '/' + id + '.png';
    img.src = `${constants.IMG_DIR}/${id}.png`;
    img.classList.add("thumb");
    if (flaggedUsers.includes(student_id)) {
      img.classList.add("blur");
    }
    sampleContainer.appendChild(img);

    row.appendChild(sampleContainer);
  }
}

let lastEle = null;

// 点击某一展示图片的事件
export function handleClick(sample, doScroll = true, chartInstance) {
  if (!sample) {
    return;
  }

  const el = document.getElementById("sample_" + sample.id);

  if (lastEle) {
    lastEle.classList.remove("emphasize");
  }

  el.classList.add("emphasize");

  if (doScroll) {
    el.scrollIntoView({
      behavior: "auto",
      block: "center",
    });
  }
  if (chartInstance) {
    chartInstance.showDynamicPoint(
      sample.point,
      sample.label,
      sample.nearestSamples
    );
  }
  lastEle = el;
}
