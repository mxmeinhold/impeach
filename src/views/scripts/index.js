var tickingElements = [];
function hookElement(id) {
  var element = document.getElementById(id);
  var elementObject = {
    hasValue: false,
  };
  tickingElements.push(elementObject);

  element.addEventListener('input', function () {
    ensureListener((elementObject.hasValue = !!element.value));
  });
}

var listening = false;
function beforeUnload(event) {
  event.preventDefault();
  return "You haven't sent your eval yet! Are you sure you want to leave?";
}

function ensureListener(definitelyValues) {
  if (definitelyValues) {
    if (!listening) {
      window.addEventListener('beforeunload', beforeUnload, { capture: true });
      listening = true;
    }
  } else if (
    !tickingElements.some(function (element) {
      return element.hasValue;
    })
  ) {
    window.removeEventListener('beforeunload', beforeUnload, { capture: true });
    listening = false;
  }
}

hookElement('name');
hookElement('position');
hookElement('likes');
hookElement('dislikes');
hookElement('comments');
