let obj = null;
function login() {
  const email = $("#email").val();
  const password = $('#psw').val();
  obj = new Object({
    email: email,
    password: password
  })
  $.ajax({
    type: "POST",
    url: "/api/auth/",
    data: JSON.stringify(obj),
    contentType: "application/json",
    dataType: "json",
    success: function (data, status, xhr) {
      window.location.href = data.redirect;
    },
    error: function (errMsg, status, xhr) {
      alert(errMsg.responseText);
    }
  })
}
function register() {
  const name = $("#name").val();
  const email = $("#email").val();
  const password = $("#psw").val();
  obj = new Object({
    name: name,
    email: email,
    password: password
  })
  $.ajax({
    type: "POST",
    url: "/api/users/",
    data: JSON.stringify(obj),
    contentType: "application/json",
    dataType: "json",
    success: function (data, status, xhr) {
      window.location.href = data.redirect;
    },
    error: function (errMsg) {
      alert(errMsg.responseText);
    }
  })
}