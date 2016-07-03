playlist = new Mongo.Collection("playlist");

moods = new Mongo.Collection("moods");
if (Meteor.isClient) {
    Session.setDefault('searching',false);
    console.log("Searching equals: "+Session.get('searching'));
    Template.search.events({
        //gets text from search form, stores it, and calls search method to get data from api
        'submit form':function(){
            Session.set('searching',true);
            console.log("Searching equals: "+Session.get('searching'));
            event.preventDefault();
            var search = event.target.searchPhrase.value;
            console.log(search);
            Meteor.call('searchTerm',search,function(error, result){
            console.log("RESULTS:"+result);
            Session.set('songsList',result);
            });
        }
    });
    
    Template.songs.helpers({
        'songList':function(){
            return Session.get('songsList');
        },
        'searching':function(){
            return Session.get('searching');
        }
    
    });
    
    Template.songs.events({
        'click #addPlaylist':function(){
            var checkBoxes = document.getElementsByClassName('songCheckbox');
            for(var i=0; i<checkBoxes.length;i++)
            {
                if(checkBoxes[i].checked)
                {
                    var value = checkBoxes[i].value
                    console.log(checkBoxes[i].value);
                    var index = value.indexOf(",");
                    var title = value.substring(0,index);
                    console.log(title);
                    var artist = value.substring(index+1,value.length);
                    console.log(artist);
                    Meteor.call('addToPlaylist',title,artist);
                        
                }
            }
            //var vals = "";
//            var songArray = [];
//            for(var i=0; i<checkBoxes.length; i++)
//            {
//                if(checkBoxes[i].checked)
//                {
//                    songArray[i]=checkBoxes[i].value;
//                    
//                    //vals += checkBoxes[i].value+" ";
//                }
//            }
//            //console.log(vals);
//            for(var i=0; i<songArray.length; i++){
//                {
//                    console.log(songArray[i]);
//                }
//                console.log(songArray.length);
//            }
        }
    });
    
    Template.about.helpers({
        'moods':function(){
            console.log("In moods function");
            Meteor.call('moods',function(error, result){
                console.log(result);
                Session.set('moodsList',result);
                });
                return Session.get('moodsList');
        }
    });
    
    Template.playlist.helpers({
        'addedSongList':function(){
            var currentUserId = Meteor.userId();
            return playlist.find({createdBy: currentUserId},{sort: {name:1}})        
        }
    });
    
    Template.playlist.events({
        'click #removePlaylist':function(){
            console.log("In removePlaylist event function.");
            var checkBoxes = document.getElementsByClassName('removeSong');
            console.log("In before the removePlaylist forLoop");
            console.log("checkBoxes length: "+checkBoxes.length);
//            console.log("Playlist length: "+Session.get('playlistLength'));
            for(var i=0; i<checkBoxes.length;i++)
            {
                console.log("in the forloop?");
                console.log(checkBoxes[i]);
            }
            for(var i=0; i<checkBoxes.length;i++)
            {
                if(checkBoxes[i].checked)
                {
                    var value = checkBoxes[i].value
                    console.log(checkBoxes[i].value);
                    var index = value.indexOf(",");
                    var title = value.substring(0,index);
                    console.log(title);
                    var artist = value.substring(index+1,value.length);
                    console.log(artist);
                    Meteor.call('removeFromPlaylist',title,artist);
                }
            }
        }
    });
    
    Template.body.helpers({
        'showingSearch':function(){
            console.log("In showingSearch function");
            return Session.get('showSearch');
        },
        'showingAbout':function(){
            console.log("In showingEvent function");
            return Session.get('showAbout');
        },
        'showingPlaylist':function(){
            console.log("In showingPlaylist funciton");
            return Session.get('showPlaylist');
        }
    });
    
    Template.body.events({
        'click #login':function(){
            event.preventDefault();
        },
        'click #search': function(){
            event.preventDefault();
            console.log("In search function");
            Session.set('showSearch',true);
            Session.set('showAbout',false);
            Session.set('showPlaylist',false);
        },
        'click #about': function(){
            event.preventDefault();
            console.log("In search function");
            Session.set('showSearch',false);
            Session.set('showAbout',true);
            Session.set('showPlaylist',false);
        },
        'click #playlist': function(){
            event.preventDefault();
            console.log("In search function");
            Session.set('showSearch',false);
            Session.set('showAbout',false);
            Session.set('showPlaylist',true);
        }
    });
    
    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });
}

if (Meteor.isServer) {
    
    Meteor.methods({
    //Get search term from the text and submit form
    'searchTerm': function(search){
        console.log(search);
        
        var baseURL ="http://developer.echonest.com/api/v4/song/search?api_key=KGV1X6BEARWAWJPFH&format=json&sort=song_hotttnesss-asc&mood="
        var searchURL = baseURL+search;
        var response = HTTP.call("GET", searchURL);
        console.log("got response:", response);
        var data = response.data.response.songs;
        return data;
             
          //loops through allBooks 
//  for(var i = 0; i<data.length; i++){
//	book(allBooks[i]);
//	console.log(allBooks[i].volumeInfo.title);
//  }
        

    },
    'moods':function(){
        var URLmood = "http://developer.echonest.com/api/v4/artist/list_terms?api_key=KGV1X6BEARWAWJPFH&format=json&type=mood";
        var responseMood = HTTP.call("GET", URLmood);
        console.log("got response:", responseMood);
        var moodData = responseMood.data.response.terms;
        return moodData;
    },
    'addToPlaylist':function(songTitle, artistName){
        var currentUserId = Meteor.userId();
        console.log(songTitle);
        console.log(artistName);
//        Session.set('playlistLength',0);
//        Session.set('playlistLength',Session.get('playlistLength')+1);
        playlist.insert({
            song: songTitle,
            artist: artistName,
            createdBy: currentUserId
        });
    },
    'removeFromPlaylist':function(songTitle,artistName){
        console.log("In removeFromPlaylist function");
        console.log(songTitle);
        console.log(artistName);
        var currentUserId = Meteor.userId();
        console.log(currentUserId);
        playlist.remove({song: songTitle, artist: artistName, createdBy: currentUserId});
//        Session.set('playlistLength',Session.get('playlistLength')-1);
    }
    });
        
//        //data testing
//        var URL = "http://developer.echonest.com/api/v4/artist/list_genres?api_key=KGV1X6BEARWAWJPFH&format=json";
//        var response = HTTP.call("GET", URL);
//        console.log("got response:", response);
//        var data = response.data;
    

}