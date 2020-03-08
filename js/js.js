"use strict"
//TODO:
// 3) button to change the order of displayed video
// 4) able to reedit the entered informations
// 5) ablet to refill the inputs with the last add or clickesd information
// 6) Future: load videos from json: it should open a new window with the table of saves file.
// the user should click it and it will be reload from this data.
// Now should be able to open a window to select the specific file.

/**
 * The code is composed and written in the order below:
 * PART 1: INITIALIZATION/SETUP/STRUCTURE
 * Class Video: create an object for each video with the specific informations
 as datei name, video title, user name and so on.
 * globalDupAndLoadInf it is a global object used to check duplicates and re-load
 * user information in the input fields (Aufnahme Datum, Patient Name and so on).
 * Class UI: used to manipulate the DOM. Here we see important methods from the
 user interface as addVideoToList, deleteVideo, clearFields, showAlertMessage,
 new date format and so on.
 * Class Store: we use here static methods to be able to call it without instatiating
 the class. Used to store the data to Local Storage (LS) and also to JSON.
 The Local Storage is used as the main store. By each new video or deleting a video
 the local storage will be updated.
 We see here many important methods as: getVideosFromLS, retrieveVideosFromLS,
 addVideo, removeVideo, downloadVideosToJSON, loadJSON.
 * So, by each modification it will be download a json file at the folder storage.
 * PART 2: User Interface Interaction/LOGIC
 * We see here eventListeners for the buttons as Select Videos, Submit and so on.
 * SUBMIT BUTTON: here is where start the hole logic. We first check if the User
 * have add all the necessary information in the inputs fields. If not the User
 * will be alert. If yes, we do these steps:
 * 1) Add Video To list (and update the ui)
 * 2) Store the Video to Local Storage
 * 3) Store the Video to a JSON file that will be direct downloaded. (Backup-Security)
 * 4) Show the success message
 * 5) Clear all the input fields!
 * @summary KJP Video System concise functionality description.
 */


/*
 * PART 1: INITIALIZATION/SETUP/STRUCTURE
 */

/**
 * Creates an object video with the respective informations as
 * dateiName, videoDate, title and so on.
 * @class
 */
class Video {
  constructor(dateiName = "", videoDate = "", patientName = "", piz = "", icdABC = [],
    dsfS = [], leitungName = "") {
    this.dateiName = dateiName;
    this.videoDate = videoDate;
    this.patientName = patientName;
    this.piz = piz;
    this.icdABC = icdABC;
    this.dsfS = dsfS;
    //variables from the local video data
    this.leitungName = "";
  }

  getLocalVideoInfos(name, size, type) {
    this.videoName = name;
    this.videoSize = size;
    this.videoType = type;
  }

  getFormData() {

    const videoDate = document.querySelector(".videoDate").value;
    const patientName = document.querySelector(".patientName").value;
    const piz = document.querySelector(".piz").value;
    const icdA = document.querySelector(".icdA").value;
    const icdB = document.querySelector(".icdB").value;
    const icdC = document.querySelector(".icdC").value;
    const icdABC = [icdA, icdB, icdC];
    //adjusting the data to be readable
    for (let i = 1; i <= 2; i++) {
      if (icdABC[i] === "") {
        icdABC[i] = "X";
      }
    }
    const dsf0 = document.querySelector(".dsf0").checked;
    const dsf1 = document.querySelector(".dsf1").checked;
    const dsf2 = document.querySelector(".dsf2").checked;
    const dsf3 = document.querySelector(".dsf3").checked;
    const dsf4 = document.querySelector(".dsf4").checked;
    const alle = document.querySelector(".alle").checked;
    const dsfS = [dsf0, dsf1, dsf2, dsf3, dsf4, alle];
    //adjusting the data to be displayed accordingly
    dsfS.forEach((item, index) => {
      if (item === true) {
        dsfS[index] = "JA"
      } else {
        dsfS[index] = "NEIN"
      }
    })

    const leitungName = document.querySelector(".leitungName").value;
    const dateiName = document.querySelector(".openSelectVideoFile").innerText;

    this.dateiName = dateiName;
    this.videoDate = videoDate;
    this.patientName = patientName;
    this.piz = piz;
    this.icdABC = icdABC;
    this.dsfS = dsfS;
    this.leitungName = leitungName;
  }
};
//video object
let video = new Video();
//global object to check the video datei name. The same video should not be upload more
//than 2 times. It is also used to reload the information as soon as we clicked!
// globalDupAndLoadInf = global Variable For Duplicates and Used To Load Information To Input Fields
let globalDupAndLoadInf = {};
/**
 * Creates an UI object video with the necessary methods to manipulate the DOM.
 * @class
 */
class UI {
  //get the actual date
  getActualDate() {
    //easiest way to get the date
    const today = new Date();
    let month = today.getMonth();
    let day = today.getDate();
    // we have to add one to the month because zero is january!
    month++;
    month = (month < 10) ? `0${month}` : month;
    day = (day < 10) ? `0${day}` : day;
    return `${day}.${month}.${today.getFullYear()}`;
  }
  //add video to the table
  addVideoToList(video, index) {

    const videoList = document.querySelector(".videoList");
    // Create tr element
    const row = document.createElement("tr");

    // const totalNumberOfVideos =  Store.getVideosFromLS(true);
    let id;
    // index tells if you start from 1 and go through the loop adding the ids
    // if is true, means that we have add a video and we need only to increment the last index number
    if (index === "false") {
      // id = document.querySelector(".videoList").childElementCount + 1;
      // Video id
      // Get the total Number of Videos (true means: get only the total number of videos)
      id = Store.getVideosFromLS(true) + 1;
    } else {
      id = index + 1;
    }

    video["id"] = id;

    if (globalDupAndLoadInf[video.dateiName] === undefined) {
      globalDupAndLoadInf[video.dateiName] = video.dateiName;
      globalDupAndLoadInf[video["id"]] = {
        videoDate: video.videoDate,
        patientName: video.patientName,
        piz: video.piz,
        icdABC: [video.icdABC[0], video.icdABC[1], video.icdABC[2]],
        dsfS: [video.dsfS[0], video.dsfS[1], video.dsfS[2], video.dsfS[3], video.dsfS[4]],
        leitungName: video.leitungName
      }
      video["notStoreSkip"] = false;
    } else {
      //it will skip this video to avoid duplicate!
      this.showAlert("Dieses Video wurde bereits hochgeladen!", "error");
      video["notStoreSkip"] = true;
      //quiting
      return;
    }
    // Insert columns
    row.innerHTML = `
      <td>${video.id}</td>
      <td>${video.dateiName}</td>
      <!-- <td><video width="320" height="240" controls><source src="./videos/${video.videoName}" type="video/mp4"></video></td> -->
      <td class="videoFlex"><video width="160" height="auto" controls><source src="./videos/${video.dateiName}" type="video/mp4"></video></td>
      <td>${video.videoDate}</td>
      <td>${video.patientName}</td>
      <td>${video.piz}</td>
      <td>${video.icdABC[0]}</td>
      <td>${video.icdABC[1]}</td>
      <td>${video.icdABC[2]}</td>
      <td>${video.dsfS[0]}</td>
      <td>${video.dsfS[1]}</td>
      <td>${video.dsfS[2]}</td>
      <td>${video.dsfS[3]}</td>
      <td>${video.dsfS[4]}</td>
      <td>${video.leitungName}</td>
      <td class="reload">
        <img src="./icons/reload.svg"></img>
      </td>
      <td  class="delete">
        <img src="./icons/delete.svg"></img>
      </td>
    `;
    //append element
    // videoList.appendChild(row);
    //appending the element in inverse order:
    // videoList.insertAdjacentElement("beforebegin", row)
    videoList.prepend(row);
  }

  deleteVideo(target) {
    // remove it from the local Storage
    Store.removeVideo(target);
    //deleting video from UI
    target.parentElement.remove();
    // show the success message
    ui.showAlert(`Das Video wurde gelöscht!`, "success");
    // Save it to JSON: extra backup! After savingToLocalStorageTheJSON file will be downlaoded.
    // It basically load the localstorage to an variable, convert it to JSON and download it.
    Store.downloadVideosToJSON();
  }
  reloadVideoData(target) {
    const id = target.parentNode.rowIndex;
    document.querySelector(".videoDate").value = globalDupAndLoadInf[id].videoDate;
    document.querySelector(".patientName").value = globalDupAndLoadInf[id].patientName;
    document.querySelector(".piz").value = globalDupAndLoadInf[id].piz;
    document.querySelector(".leitungName").value = globalDupAndLoadInf[id].leitungName;
    document.querySelector(".icdA").value = globalDupAndLoadInf[id].icdABC[0];
    if (globalDupAndLoadInf[id].icdABC[1] !== "X") document.querySelector(".icdB").value = globalDupAndLoadInf[id].icdABC[1];
    if (globalDupAndLoadInf[id].icdABC[2] !== "X") document.querySelector(".icdC").value = globalDupAndLoadInf[id].icdABC[2];
    if (globalDupAndLoadInf[id].dsfS[0] === "JA") {
      document.querySelector(".dsf0").checked = true
    }
    if (globalDupAndLoadInf[id].dsfS[1] === "JA") {
      document.querySelector(".dsf1").checked = true
    }
    if (globalDupAndLoadInf[id].dsfS[2] === "JA") {
      document.querySelector(".dsf2").checked = true
    }
    if (globalDupAndLoadInf[id].dsfS[3] === "JA") {
      document.querySelector(".dsf3").checked = true
    }
    if (globalDupAndLoadInf[id].dsfS[4] === "JA") {
      document.querySelector(".dsf4").checked = true
    }
  }
  // Clear the input fields
  clearFields() {
    // clearing the form!
    document.querySelector(".form").reset();
    document.querySelector(".openSelectVideoFile").innerText = "VIDEO AUSWÄHLEN";
  }

  showAlert(message, className) {
    //create div
    const div = document.createElement("div");
    //add classes: the class alert is used to be able to remove it afterwards!
    div.className = `alert ${className}`;
    // Add text
    div.appendChild(document.createTextNode(message));
    // Get the element to be insert it
    const container = document.querySelector(".container");
    // get the element in which the div will be insert before it
    const form = document.querySelector(".form");
    // insert alert
    container.insertBefore(div, form);

    //the message should disappear after 3 seconds
    setTimeout(function() {
      document.querySelector(".alert").remove();
    }, 6000);
  }

  //Writing the Date in the table in another format
  newDateFormat(date) {
    let stringArray = date.split("");
    let day = [],
      month = [],
      year = [];
    let index = 0;
    stringArray.forEach(function(item) {

      if (index === 0) {
        year.push(item);
      } else if (index === 1) {
        month.push(item);
      } else {
        day.push(item);
      }
      if (item === "-") {
        index++;
      }

    });
    // console.log(`${day[0]}${day[1]} / ${month[0]}${month[1]} / ${year[0]}${year[1]}${year[2]}${year[3]}`);

    return `${day[0]}${day[1]} / ${month[0]}${month[1]} / ${year[0]}${year[1]}${year[2]}${year[3]}`

  }

}; //end of class UI
// ui object!
const ui = new UI();

/**
 * Local Storage Class - static so we do not need to instantiate
 * retrieve, save and delete information to the local storage
 * download JSON and LOAD JSON to the Local Storage
 * @class
 */
class Store {

  // Get Videos from LocalStorage or the total number of videos
  static getVideosFromLS(getTotalNumberOfVideos = false) {
    let videos;
    // let obj = {};
    // obj[video["dateiName"]] = video;
    if (localStorage.getItem("videos") === null) {
      videos = {};
    } else {
      videos = JSON.parse(localStorage.getItem("videos"));
    }
    if (getTotalNumberOfVideos) return Object.keys(videos).length;
    return videos;
  }

  static displayVideos() {
    let videos = Store.getVideosFromLS();
    //removing the keys and converting it to an array, then we can loop through it
    videos = Object.values(videos);
    videos.forEach((item, index) => {
      ui.addVideoToList(item, index)
    })

    //update the total number of videos!
    document.querySelector(".numberTotalOfVideos").innerText = `${videos.length}`;

  }

  // Add Video to localStorage: we get the stored videos, add the new (push), then
  // set the localStorage again
  static addVideo(video) {
    let videos = Store.getVideosFromLS();
    // add to LocalStorage
    videos[video["dateiName"]] = video;
    localStorage.setItem("videos", JSON.stringify(videos));
  }

  static removeVideo(target) {

    let videos = Store.getVideosFromLS();
    // videos = Object.values(videos);
    let videoToDelete = target.parentElement.cells[1].innerText;
    //deleting the video from global temporary storage
    globalDupAndLoadInf[videos[videoToDelete].dateiName] = undefined;
    delete videos[videoToDelete];
    //update the total number of videos!
    // let totalNumberOfVideos = parseInt(document.querySelector(".numberTotalOfVideos").innerText)-1;
    document.querySelector(".numberTotalOfVideos").innerText = `${Object.keys(videos).length}`;
    //rewriting localStorage
    // localStorage.clear();
    localStorage.setItem("videos", JSON.stringify(videos));
    //we need unfortunatelly at this point to refresh the page!
    //here is where we need to optimize. For 1000 videos takes around 3 seconds to update
    // location.reload();
  }

  //in browser: it should download it direct to the storage folder! Important
  //because here we do not have access to local storage and to simplify I do not
  //want to use a backserver with Node.js that it is still an option!
  static downloadVideosToJSON() {
    // Save as file
    // trying to save it as a file
    /*setting*/
    const videos = Store.getVideosFromLS();
    // videos = Object.values(videos);
    const fileJSON = JSON.stringify(videos);

    // let dataUri = 'data:./storage/json;charset=utf-8,'+ encodeURIComponent(fileJSON);
    let dataUri = 'data:storage/json;charset=utf-8,' + encodeURIComponent(fileJSON);

    let exportFileDefaultName = 'table.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    linkElement.remove();
  }

  // The method XMLhttpRequest works only if you have a server installed.
  // easier way: go to your project file throught prompt command and type:
  // npm install -g live-server
  // run it typing: live-server
  static loadJSON() {
    var xhttp = new XMLHttpRequest();
    // we will use now onload instead of onreadystatechange. So we do not need
    // to check for this.readyState
    xhttp.onload = function() {
      // xhttp.onreadystatechange = function() {
      // readyState 4: the response has been capture and can be used
      // status: http status of 200 means that everything is ok
      var videoList = "";
      // if (this.readyState == 4 && this.status == 200) {
      if (this.status == 200) {
        // Convert the json to and object
        let videos = JSON.parse(xhttp.responseText);
        // Storing the table in the Local Storage
        localStorage.setItem("videos", JSON.stringify(videos));
        // converting it to an array!
        videos = Object.values(videos)
        //loading the table ui: looping through the videos and add it!
        videos.forEach(function(item, index) {
          ui.addVideoToList(item, index);
        });

        //update the total number of videos!
        document.querySelector(".numberTotalOfVideos").innerText = `${videos.length}`;
      }
    };
    xhttp.open("GET", "./storage/table.json", true);

    xhttp.onerror = function() {
      alert("Please, restart the live-server!!!, Error on XMLHttpRequest")
      console.log("Request error in XMLHttpRequest...");
    }
    xhttp.send();

  }
} //end of class storage


/*
 * PART 2: User Interface Interaction/LOGIC
 */
/* LOAD TABLE FROM A JSON FILE
 * As Backup it will load the JSON file! Necessary in case the Local Storage is
 * cleared!
 */
document.querySelector(".loadTableFromJSON").addEventListener("click", function() {
  //clearing the store data from local STORAGE
  localStorage.clear();
  globalDupAndLoadInf = {};
  // document.querySelector(".videoList").remove();
  let taskList = document.querySelector(".videoList");
  if (taskList.children.length > 0) {
    do {
      taskList.children[taskList.children.length - 1].remove();
    } while (taskList.children.length > 0);
  }
  Store.loadJSON();
});

/* DOWNLOAD A VIDEO TO A JSON FILE
 * As Backup it will load the JSON file! Necessary in case the Local Storage is
 * cleared!
 */
document.querySelector(".downloadVideoToJSON").addEventListener("click", function() {
  Store.downloadVideosToJSON();
});

/* OPEN A DIALOG BOX TO SELECT A VIDEO
 * It opens a dialog box to be able to select the video to be stored. The info
 * capture is the name, file and size of the video. The videos should be always in
 * a specific folder already defined. In this case ./videos/*.mp4
 * Why? Because of the restrictions/security added by all browsers!
 * At this moment the video must be copy/save direct to the videos folder!
 */
document.querySelector(".openSelectVideoFile").addEventListener("click", function() {

  // open a file selection dialog: the folder path will be set always through the last
  // added video. It is automatically and we cannot change here.
  // Important: we need to get only the video data!
  const input = document.createElement('input');
  input.type = 'file';
  // handle the selected file
  input.onchange = e => {
    const file = e.target.files[0];
    document.querySelector(".openSelectVideoFile").innerText = file.name;
    video.getLocalVideoInfos(file.name, file.size, file.type);
  }
  input.click();
});

/* REMOVE FORM FOR BETTER TABLE VISUALIZATION
 * It toogles the form to be allowed to see only the table on the screen
 */
document.querySelector(".toggleContainer").addEventListener("click", function() {
  if (document.querySelector(".container").classList.contains("openClose")) {
    document.querySelector(".toggleContainer").innerText = "Eingabeformular schließen";
    document.querySelector(".container").classList.toggle("openClose");
  } else {
    document.querySelector(".toggleContainer").innerText = "Eingabeformular öffnen";
    document.querySelector(".container").classList.toggle("openClose");
  }
});

//EXECUTED BY EACH PAGE REFRESH/LOAD
/* DOM Load Event: InitializatioN
 * It's a very important step. Here the localStorage will be retrieve and the table
 * list of videos will be filled.
 */
document.addEventListener("DOMContentLoaded", () => {
  // getting the load time
  let t1 = performance.now();
  // get the actual data an displaying it!
  document.querySelector(".datum").innerText = ui.getActualDate();
  Store.displayVideos();
  //Load the input field with the actual date
  //reorganizing the data before to upload
  (function() {
    var date = new Date().toISOString().substring(0, 10),
      field = document.querySelector('.videoDate');
    field.value = date
    // console.log(field.value);
  })()

  let t2 = performance.now();
  console.log(`Load Time Elapsed: ${(t2-t1)/1000} seconds`);
});

/* SUBMIT
 * It submit the form! Here is where the hole logic of this video archive starts.
 * 0) Check Inputs
 * 1) Check for duplicates
 * 2) Add Video To list (and update the ui)
 * 3) Store the Video to Local Storage
 * 4) Store the Video to a JSON file that will be direct downloaded. (Backup-Security)
 * 5) Show the success message
 * 6) Clear all the input fields!
 */
document.querySelector("#submit").addEventListener("click", function(e) {
  const t1 = performance.now();
  video.getFormData();

  // Validate inputs
  if (video.dateiName === "VIDEO AUSWÄHLEN") {
    ui.showAlert("Bitte wählen Sie ein Video!", "error");
  } else if (video.dateiName.length > 20 || video.dateiName.length < 6) {
    ui.showAlert(`Der Video Name: ${video.dateiName} muss zwischen 6 und 20 Zeichen enthalten!`, "error");
  } else if (!validateDate(video.videoDate) || !validateName(video.patientName) || !validatePiz(video.piz) ||
    !validateIcdABC(video.icdABC) || !validateDsfS(video.dsfS) || !validateName(video.leitungName)) {
    ui.showAlert("Bitte überprüfen Sie Ihre Eingaben!", "error");
  } else {
    // Add video to the video list table
    ui.addVideoToList(video, "false");
    //the video will be not add in case of duplicate!
    if (!video.notStoreSkip) {
      // Add video to LocalStorage: it will load the local storage and push the new video
      Store.addVideo(video);
      //increment the number of videos in case of adding it
      document.querySelector(".numberTotalOfVideos").innerText = `${Store.getVideosFromLS(true)}`;
      // Save it to JSON: extra backup! After savingToLocalStorageTheJSON file will be downlaoded.
      // It basically load the localstorage to an variable, convert it to JSON and download it.
      Store.downloadVideosToJSON();
      // Show sucess message
      ui.showAlert(`Hallo ${video.leitungName}, das Video: ${video.dateiName} ist hochgeladen!`, "success");
      // Clear Fields
      ui.clearFields();
    }

  }
  e.preventDefault();

  const t2 = performance.now();
  console.log(`Submit Time Elapsed: ${(t2-t1)/1000} seconds.`)
});
/* DELETE THE VIDEO
 * If the user clicked in the X field, it will clear the video and update the
 * Local Storage. In this case, will not be generate a JSON file.
 */
document.querySelector(".videoList").addEventListener("click", function(e) {
  let t1 = performance.now();
  if (e.target.parentElement.className === "delete") ui.deleteVideo(e.target.parentElement);
  let t2 = performance.now();
  console.log(`Delete Time Elapsed: ${(t2-t1)/1000} seconds`);
  if (e.target.parentElement.className === "reload") ui.reloadVideoData(e.target.parentElement)
});

/*
 ***REGULAR EXPRESSIONS TO VALIDATE THE INPUT!!!!
 */
// patientName should be only carachters the firstname, lastname FORMAT!!!
function validateName(Name) {
  if (Name === "") {
    Name = "Patient Name und Leitung Name"
  };
  const re = /^([a-zA-Z]{2,16})\,[ ]([a-zA-Z]{3,16})$/;
  if (!re.test(Name)) {
    ui.showAlert(`Der ${Name} sollte in diesem Format geschrieben sein: Nachname, Vorname! Der Vor- und Nachname muss zwischen 2 und 16 Zeichen enthalten!`, "error");
  } else {
    return true;
  }
}
// videoDate should be in the format mm/dd/yyyy
function validateDate(videoDate) {
  // We check this format here: "2019-07-05"
  const re = /^\d{4}[-]\d{2}[-]\d{2}$/;
  if (!re.test(videoDate)) {
    ui.showAlert("Das Datum sollte im Format MM / TT / JJJJ sein", "error");
  } else {
    return true;
  }
}
// piz should have exactly 8 digits
function validatePiz(piz) {
  // We check that the video number should have exactly 8 digits!
  /*
  String regEx = "^[0-9]{8}$";
    ^ - start with a number.
    [0-9] - use only digits (you can also use \d )
    {8} - use 8 digits.
    $ - End here. Don't add anything after 8 digits.
  */
  const re = /^[0-9]{8}$/;
  if (!re.test(piz)) {
    ui.showAlert("Die Piz-Nummer muss zwischen 11111111 und 99999999 liegen", "error");
  } else {
    return true;
  }
}
//The video should not be upload if the icdA is empty... The icdB and icdC can be empty.
function validateIcdABC(icdABC) {
  if (icdABC[0] === "") {
    ui.showAlert("Mindestens die ICD_A sollte ausgefüllt werden", "error");
  } else {
    return true;
  }
}
//The video should not be upload if, at least, one of the fields of dsf1, dsf2...
//is not checked
function validateDsfS(dsfS) {
  for (let i = 0; i < dsfS.length; i++) {
    if (dsfS[i] === "JA") {
      return true;
    }
  }
  ui.showAlert("Die Freigabe der Videoaufnahme dieses Patienten MUSS vorliegend sein", "error");
  return false;
}

/*adding eventlister to the checkboxALLE*/
document.querySelector(".alle").addEventListener("input", () => {
  if (document.querySelector(".alle").checked === true) {
    document.querySelector(".dsf0").checked = true
    document.querySelector(".dsf1").checked = true
    document.querySelector(".dsf2").checked = true
    document.querySelector(".dsf3").checked = true
    document.querySelector(".dsf4").checked = true
  }
})

/*Menu - fast solution*/
/*Admin an administrator password to login*/
document.querySelector(".admin").addEventListener("click", () => {
  let password = prompt("Please, enter the admin password");
  if ( password === "wurzelAndroid!") {
    document.querySelector(".deleteAllVideos").classList.toggle("noDisplay");
    document.querySelector(".downloadVideoToJSON").classList.toggle("noDisplay");
    document.querySelector(".loadTableFromJSON").classList.toggle("noDisplay");
  } else {
    alert("The password is not correct!");
  }
})

//adding possibility to delete all the videos
document.querySelector(".deleteAllVideos").addEventListener("click", () => {
  let t1 = performance.now();
  localStorage.clear();
  location.reload();
  let t2 = performance.now();
  console.log(`Clear Table & Load Page Time Elapsed: ${(t2-t1)/1000} seconds`);
})
