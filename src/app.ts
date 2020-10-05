import HTMLConnector from "./html_connector";

window.onload = () => {
  const htCon = new HTMLConnector();
  htCon.startGame();
  
  const uploadBtn = document.getElementById('add_map');
  
  const fileName = document.getElementById('upload-label');
  
  uploadBtn.addEventListener('change', function(){
    fileName.textContent = this.files[0].name;
  })
};
