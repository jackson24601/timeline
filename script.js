const exampleEvents = [
  "The first permanent English settlement is founded at Jamestown.",
  "The Declaration of Independence is signed.",
  "The U.S. Constitution is ratified.",
  "The Louisiana Purchase doubles the size of the United States.",
  "The Civil War begins.",
  "The 19th Amendment gives many women the right to vote.",
];

const eventsInput = document.querySelector("#events-input");
const loadExampleButton = document.querySelector("#load-example");
const startGameButton = document.querySelector("#start-game");
const editEventsButton = document.querySelector("#edit-events");
const checkAnswerButton = document.querySelector("#check-answer");
const reshuffleButton = document.querySelector("#reshuffle");
const showAnswerButton = document.querySelector("#show-answer");
const setupMessage = document.querySelector("#setup-message");
const gameMessage = document.querySelector("#game-message");
const setupCard = document.querySelector("#setup-card");
const gameCard = document.querySelector("#game-card");
const timelineList = document.querySelector("#timeline-list");

let correctEvents = [];
let currentEvents = [];
let draggedIndex = null;

loadExampleButton.addEventListener("click", () => {
  eventsInput.value = exampleEvents.join("\n");
  showMessage(setupMessage, "Example loaded. You can edit it or scramble it now.", "success");
});

startGameButton.addEventListener("click", () => {
  const events = parseEvents(eventsInput.value);

  if (events.length < 2) {
    showMessage(setupMessage, "Please enter at least two timeline events.", "error");
    return;
  }

  correctEvents = events;
  currentEvents = shuffleEvents(events);
  renderTimeline();
  setupCard.classList.add("hidden");
  gameCard.classList.remove("hidden");
  clearMessage(setupMessage);
  showMessage(gameMessage, `${events.length} events scrambled. Move them into the correct order.`, "warning");
  gameCard.scrollIntoView({ behavior: "smooth", block: "start" });
});

editEventsButton.addEventListener("click", () => {
  setupCard.classList.remove("hidden");
  eventsInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

reshuffleButton.addEventListener("click", () => {
  if (!correctEvents.length) return;
  currentEvents = shuffleEvents(correctEvents);
  renderTimeline();
  showMessage(gameMessage, "The events have been scrambled again.", "warning");
});

checkAnswerButton.addEventListener("click", () => {
  if (isCorrectOrder()) {
    showMessage(gameMessage, "Correct! The timeline is in order.", "success");
    return;
  }

  showMessage(gameMessage, "Not quite yet. Try moving a few events and check again.", "error");
});

showAnswerButton.addEventListener("click", () => {
  currentEvents = [...correctEvents];
  renderTimeline();
  showMessage(gameMessage, "Here is the correct timeline.", "success");
});

function parseEvents(value) {
  return value
    .split("\n")
    .map((event) => event.trim())
    .filter(Boolean);
}

function shuffleEvents(events) {
  const shuffled = [...events];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  if (shuffled.length > 1 && arraysMatch(shuffled, events)) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }

  return shuffled;
}

function renderTimeline() {
  timelineList.innerHTML = "";

  currentEvents.forEach((eventText, index) => {
    const item = document.createElement("li");
    item.className = "timeline-item";
    item.draggable = true;
    item.tabIndex = 0;
    item.dataset.index = String(index);

    item.addEventListener("dragstart", handleDragStart);
    item.addEventListener("dragenter", handleDragEnter);
    item.addEventListener("dragover", handleDragOver);
    item.addEventListener("dragleave", handleDragLeave);
    item.addEventListener("drop", handleDrop);
    item.addEventListener("dragend", handleDragEnd);

    const position = document.createElement("span");
    position.className = "position";
    position.textContent = String(index + 1);
    position.setAttribute("aria-hidden", "true");

    const event = document.createElement("span");
    event.className = "event-text";
    event.textContent = eventText;

    const controls = document.createElement("div");
    controls.className = "item-controls";

    const upButton = createMoveButton("Move up", index, -1);
    const downButton = createMoveButton("Move down", index, 1);
    upButton.disabled = index === 0;
    downButton.disabled = index === currentEvents.length - 1;

    controls.append(upButton, downButton);
    item.append(position, event, controls);
    timelineList.append(item);
  });
}

function createMoveButton(label, index, direction) {
  const button = document.createElement("button");
  button.className = "secondary-button small-button";
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", () => {
    moveEvent(index, index + direction);
  });
  return button;
}

function moveEvent(fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= currentEvents.length) return;

  const [event] = currentEvents.splice(fromIndex, 1);
  currentEvents.splice(toIndex, 0, event);
  renderTimeline();
  clearMessage(gameMessage);
}

function handleDragStart(event) {
  draggedIndex = Number(event.currentTarget.dataset.index);
  event.currentTarget.classList.add("dragging");
  event.dataTransfer.effectAllowed = "move";
}

function handleDragEnter(event) {
  event.currentTarget.classList.add("drop-target");
}

function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove("drop-target");
}

function handleDrop(event) {
  event.preventDefault();
  const dropIndex = Number(event.currentTarget.dataset.index);
  event.currentTarget.classList.remove("drop-target");

  if (draggedIndex === null || draggedIndex === dropIndex) return;

  moveEvent(draggedIndex, dropIndex);
}

function handleDragEnd() {
  draggedIndex = null;
  document.querySelectorAll(".timeline-item").forEach((item) => {
    item.classList.remove("dragging", "drop-target");
  });
}

function isCorrectOrder() {
  return arraysMatch(currentEvents, correctEvents);
}

function arraysMatch(first, second) {
  return first.length === second.length && first.every((value, index) => value === second[index]);
}

function showMessage(element, text, type) {
  element.textContent = text;
  element.className = `message ${type}`;
}

function clearMessage(element) {
  element.textContent = "";
  element.className = "message";
}
