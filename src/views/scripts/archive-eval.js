function delet(id) {
  fetch(`/api/delet/${id}`, {
    method: 'DELETE',
    cache: 'no-cache',
  })
    .then((response) => response.json())
    .then((data) => document.getElementById(id).remove())
    .catch((error) => console.error(error));
}

function hide(id) {
  fetch(`/api/hide/${id}`, {
    method: 'PUT',
    cache: 'no-cache',
  })
    .then((response) => response.json())
    .then((data) => document.getElementById(id).remove())
    .catch((error) => console.error(error));
}

function publish(id) {
  fetch(`/api/publish/${id}`, {
    method: 'PUT',
    cache: 'no-cache',
  })
    .then((response) => response.json())
    .then((data) => document.getElementById(id).remove())
    .catch((error) => console.error(error));
}
