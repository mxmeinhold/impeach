function delet(id) {
  fetch(`/api/delet/${id}`, {
    method: 'POST',
    cache: 'no-cache',
  })
    .then((response) => response.json())
    .then((data) => document.getElementById(id).remove())
    .catch((error) => console.error(error));
}
