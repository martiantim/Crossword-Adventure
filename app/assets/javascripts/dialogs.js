Dialogs = function()
{
	this.showingVideo = false;
	this.weekdays = new Array("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday");	
}

Dialogs.prototype = 
{
	showDialog:function()
	{		
    var dialog = $('dynamic_dialog');
    
    //if can find grid put in the middle of it
    var grid = $('grid');
    var clist = $('theme_clue_list');

    if (grid) {
      dialog.style.left = (grid.offsetLeft + 25) + "px";
      dialog.style.top = (grid.offsetTop + 50) + "px";
    } else if (clist) {
      dialog.style.left = (clist.offsetLeft + 75) + "px";
      dialog.style.top = (clist.offsetTop + 75) + "px";
    } else {
      dialog.style.top = "150px";      
    }
    
    dialog.style.display = "block";
	},

	isDialogVisible:function()
	{
		return document.getElementById('dynamic_dialog').style.display == "block";
	},
	
	hideDialog:function()
	{
		$('dynamic_dialog').style.display = "none";
		if ((typeof(board) != "undefined") && (board)) {
			board.setFocus();
		}
		this.showingVideo = false;
	},
    
    //
    // Dialogs
    //
    
    fixDifficulty:function(x, y, dir)
	{
		this._showDifficultyDialog("dialogs.updatePuzzleClueDifficulty("+ x + "," + y + ",'" + dir + "')");
	},

	editDifficulty:function(clue_id)
	{
		this._showDifficultyDialog("dialogs.updateClueDifficulty("+ clue_id + ")");
	},
	
	_showDifficultyDialog:function(updateFunc)
	{
		var html = "<h3>What is the proper difficulty of this clue?</h3>";
		
		html += "<select id='difficulty'>";
		for (var i = 0; i < this.weekdays.length; i++)
		{			
			html += "<option value='" + this.weekdays[i] + "'>" + this.weekdays[i] + "</option>";
		}
		html += "</select>";
		html += "<input type='button' class='inputsubmit' onClick=\"" + updateFunc + "\" value='Fix'>";
		html += "<input type='button' class='inputsubmit' value='Close' onclick='dialogs.hideDialog();'>";		
		
		
		$('dialog_content').innerHTML = html;
				
		dialogs.showDialog();
	},
	
 	updatePuzzleClueDifficulty:function(x, y, dir)
	{
		var difficulty = document.getElementById('difficulty').value;
	
		API.updatePuzzleClueDifficulty(challengeID, x, y, dir, difficulty, this.onUpdatedDifficulty);
		if (data)
		{
			clue = this.getClue(new Point(x, y), dir != "across");
			clue.difficulty = difficulty;
			board.reDrawClue();	 
		}
		
		//urchinTracker('/endlesscrossword/ajax/updateDifficulty');
	},
	
	updateClueDifficulty:function(id)
	{
		var difficulty = $('difficulty').value;
	
		API.updateClueDifficulty(id, difficulty, this.onUpdatedDifficulty);
	},
	
    onUpdatedDifficulty:function()
	{
		dialogs.hideDialog();
	},
	
	editPuzzleClueCategory:function(x, y, dir)
	{
		var clue = puzzle.getClue(new Point(x,y), dir == "down");				
		var word = puzzle.getClueSolution(clue);

		this._showCategorizerDialog(word, clue.text, "dialogs.updatePuzzleClueCategory( "+ x + "," + y + ",'" + dir + "'");
	},

	editClueCategory:function(word, text, clue_id)
	{
		this._showCatagorizerDialog(word, text, "dialogs.updateClueCategory("+ clue_id + ")");
	},
	    
	_showCatagorizerDialog:function(word, text, updateFunc)
	{
		html = "<div style='padding: 0px 10px 10px'><h4>Categorize a Clue</h4>";		
		html += "<p>Can you put this clue in a category? ";
		html += "<a onClick=\"document.getElementById('why').style.display = 'block'\">Why?</a>";
		html += "<span id='why' style='display:none'>We are attempting to categorize clues so that more customized puzzles can be made (puzzle with no french word clues, puzzle that has a lot of geography clues, etc.)</span>";
		html += "</p>";
		html += "<div style='padding-left: 30px'><div style='padding: 15px 0px; font-size: 14px;'>" + text + ": " + word + "</div>";
		html += "<div style='float: left'><div>";
		html += "<select id='category'>";
		for (var i = 0; i < CLUE_CATEGORIES.length; i++)
		{
			var cat = CLUE_CATEGORIES[i];
			html += "<option value='" + cat + "'>" + cat + "</option>";
		}
		html += "</select></div>";
		html += "<div style='padding: 5px 0px;'><input type='button' class='inputsubmit' value='Categorize Clue' onClick=\"" + updateFunc + "\"></div></div>";
		html += "<div style='float: right'>";
		html += "<INPUT TYPE=CHECKBOX name='nomore' id='nomore'>Don't ask again<br>";
		html += "<input type='button' class='inputsubmit' value='Close' onclick='dialogs.hideDialog();'></div></div>";		

		$('dialog_content').innerHTML = html;
				
		dialogs.showDialog();
	},
	
	updateClueCategory:function(id)
	{
		var category = $('category').value;
	
		API.updateClueCategory(id, category, this.onUpdatedDifficulty);
	},
	
    onUpdatedCategory:function()
	{
		dialogs.hideDialog();
	},

	editClueType:function(word, text, clue_id)
	{
		html = "<div style='padding: 0px 10px 10px'><h4>Categorize a Clue</h4>";		
		html += "<p>Please enter the type for this clue? ";
		html += "</p>";
		html += "<div style='padding-left: 30px'><div style='padding: 15px 0px; font-size: 14px;'>" + text + ": " + word + "</div>";
		html += "<div style='float: left'><div>";
		html += "<select id='type'>";
		for (var i = 0; i < CLUE_TYPES.length; i++)
		{
			var t = CLUE_TYPES[i];
			html += "<option value='" + t + "'>" + t + "</option>";
		}
		html += "</select></div>";
		html += "<div style='padding: 5px 0px;'><input type='button' class='inputsubmit' value='Typize Clue' onClick=\"dialogs.updateClueType("+ clue_id + ")\"></div></div>";
		html += "<div style='float: right'>";
		html += "<input type='button' class='inputsubmit' value='Close' onclick='dialogs.hideDialog();'></div></div>";		

		$('dialog_content').innerHTML = html;
				
		dialogs.showDialog();
	},

	updateClueType:function(id)
	{
		var type = $('type').value;
	
		API.updateClueType(id, type, this.onUpdatedDifficulty);
	},
	
    onUpdatedType:function()
	{
		dialogs.hideDialog();
	},

  showPuzzleComplete:function(congrats)
	{
    if (!congrats) {
      congrats = "Congratulations! You completed the puzzle!"; 
    }
		var html = "<div style='padding: 0px 10px 10px'><h4>Puzzle Complete</h4>";		
		html += "<p>" + congrats + "</p>";
    
//    if (show_input_name) {
//      html += "<p>Please enter your name for the high scores page</p>";
//      html += "<p>First name: <input type='text' name='first_name'><p>";
//    }
    
		html += "<div style='float: right'>";
		html += "<input type='button' class='inputsubmit' value='Close' onclick='dialogs.hideDialog();'></div></div>";		

		$('dialog_content').innerHTML = html;
		
		dialogs.showDialog();
	},
	
	editClueText:function(oldText, clue_id)
	{
		var html = "<h3>Enter a better clue</h3>";
		
		html += "<div><input type='text' value=\"" + oldText + "\" id='clue_text'></div>";
		html += "<input type='button' class='inputsubmit' value='Update' onClick=\"dialogs.updateText(" + clue_id + ")\">";
		html += "<input type='button' class='inputsubmit' value='Close' onclick='dialogs.hideDialog();'>";		
		
		$('dialog_content').innerHTML = html;
				
		dialogs.showDialog();
	},
	
	updateText:function(clue_id)
	{
		var newText = $('clue_text').value;
	
		API.updateClueTextByClueID(clue_id, newText, this.onUpdatedText);
	},
	
    onUpdatedText:function()
	{
		dialogs.hideDialog();
	},
	
	showVideoClue:function(video_id, text)
	{
		var html = "<div style='padding: 0px 10px 10px'><h4>Video Clue</h4>";		
		html += "<div style='float: left';>";
        html += "<img id='video_spinner' style='position:relative;left: 100px; top: 100px;z-index: 2;' src='/images/video_spinner.gif'/>";
		html += "<div id='videospot' style='z-index: 3'></div>";
		html += "<p>" + text + "</p>";
		html += "<div style='float: right'>";
		html += "<input type='button' class='inputsubmit' value='Close' onclick='dialogs.hideDialog();'></div></div>";		
		html += "</div>";
		
		$('dialog_content').innerHTML = html;
		$('dynamic_dialog').style.left = "65px";
		$('dynamic_dialog').style.top = "50px";
		$('dynamic_dialog').style.width = "550px";
		
		dialogs.showDialog();
		this.showingVideo = true;
		
        setTimeout(dialogs.hideSpinner, 50);	
         
		var flashVars = {clip:video_id, autoPlay:true, format:"f4v",logo:"http://endlesscrossword.com/images/1x1.png"};
      	var params =  {allowScriptAccess:"always", allowFullScreen:true ,base:"http://static.thoughtequity.com/video/etc/"};
      	var attributes = {};
      	swfobject.embedSWF("http://static.thoughtequity.com/video/etc/TePlayer.swf", "videospot", 480, 270, "9.0.0", null, flashVars, params, attributes);
	},
   
  showPhotoClue:function(img_url, text, attribution)
	{
		var html = "<div style='padding: 0px 10px 10px'><h4>Photo Clue</h4>";		
		html += "<div style='float: left';>";
		html += "<div><img src='" + img_url+"'></div>";
    html += "<div style='padding: 5px 0px;'>";
		html += "  <p style='float:left'>" + text + "</p>";
    if (attribution) {
      html += "  <div style='float:right;font-size: 9px;'>" + attribution + "</div>";
    }
    html += "  <div class='clear'></div>";
    html += "</div>";
		html += "<div style='float: right'>";
		html += "<input type='button' class='inputsubmit' value='Close' onclick='dialogs.hideDialog();'></div></div>";		
		html += "</div>";
		
		$('dialog_content').innerHTML = html;
		$('dynamic_dialog').style.left = "65px";
		$('dynamic_dialog').style.top = "50px";
		$('dynamic_dialog').style.width = "550px";
		
		dialogs.showDialog();
		this.showingVideo = true;         
	},
     
    hideSpinner:function()
    {
      var el = $('videospot');
      
      if ((el) && (el.tagName == 'OBJECT')) {
          $('video_spinner').style.display = 'none';
      } else {
          setTimeout(dialogs.hideSpinner, 50);
      }
    },
	
	showAddClueDialog:function(button_text, word, clue, media_link, attribution, extra_params, dest)
	{
    if (!word) { word = ''; }
    if (!clue) { clue = ''; }
    if (!extra_params) { extra_params = ''; }
    if (!media_link) { media_link = ''; }
    if (!attribution) { attribution = ''; }
    if (!dest) { dest = 'updater_div'; }
    
    //media check
    var none_checked = '';
    var picture_checked = '';
    var video_checked = '';
    if (media_link.match("thoughtequity://")) {
      video_checked = "checked='true'";
    } else if (media_link.match("flickr.com")) {
      picture_checked = "checked='true'";
    } else {
      none_checked = "checked='true'";
    }
    
    var is_edit = true;
    var word_disabled = "disabled";
    if (extra_params == '') { 
      is_edit = false; 
      word_disabled = '';
    }
    
		var html = "";    
    html += "<form id='new_clue_form' method='get'>";    
    html += "<input type='hidden' id='dialog_media' value='" + media_link + "'>";    
    html += "<input type='hidden' id='dialog_attribution' value=''>";
    html += "<input type='hidden' id='extra_params' value='" + extra_params + "'>";
    
    html += "<a onclick='dialogs.hideDialog();' id='dialog_cancel'>&nbsp;</a>";
    if (is_edit) {
      html += "<h4>Edit Clue</h4>";
    } else {      
      html += "<h4>Submit a New Clue</h4>";
    }
    		
    html += "<div id='dialog_buttons'>";    
		html += "<input class='button enabled' type='button' onclick='dialogs.addClue(" + dest.inspect(true) + ")' value='" + button_text + "' name='add' id='add_clue' class='inputsubmit'/>";						
    html += "</div>";
    html += "<div class='clear'></div>";
    
    html += "<div id='dialog_body'>"; 
		html += "  <div class='dialog_line'>";
		html += "    <div class='dialog_label'>Word:</div>";
    html += "	   <div class='dialog_input'><input id='dialog_word' class='inputtext' type='text' style='width:100px' value='" + word + "' "+word_disabled+"></input></div>";
		html += "    <div class='clear'></div>";
    html += "  </div>";
		
    html += "  <div class='dialog_line'>";
		html += "	   <div class='dialog_label'>Clue:</div>";
		html += "    <div class='dialog_input'><input id='dialog_clue' class='inputtext' type='text' style='width:307px' value='" + clue + "'></div>";
    html += "    <div class='clear'></div>";
		html += "  </div>";
     
    html += "<div id='other_clues'></div>";
     
		html += "  <div class='dialog_line'>";         
		html += "	   <div class='dialog_label'>Media:</div>";
    html += "    <div class='dialog_input'>";
    html += "      <input id='media_radio_none' type='radio' name='media' onchange='dialogs.mediaChange();' value='none' "+none_checked+"/> None";
    html += "      <input id='media_radio_picture' type='radio' name='media' onchange='dialogs.mediaChange();' value='picture' "+picture_checked+"/> Picture";
//    html += "      <input id='media_radio_video' type='radio' name='media' onchange='dialogs.mediaChange();' value='video' "+video_checked+"/> Video";
    html += "    </div>";
    html += "    <div class='clear'></div>";
    html += "  </div>"
       
    
    //preview of media
    html += "  <div id='image_display' style='display:none'>";
    html += "    <div id='current_image'></div>";
    html += "    <div id='change_image'><input class='button' type='button' value='Change' onclick=\"$('dialog_media').value=''; dialogs.mediaChange();\"></div>";
    html += "      <div class='clear'></div>";
    html += "  </div>";
    
    //image search
    html += "  <div id='image_search' style='display:none'>";
    html += "    <div clas='dialog_line'>";
    html += "      <div class='dialog_label'>Keyword:</div>";
    html += "      <div class='dialog_input' id='media_search_tag'><input class='inputtext' type='text' id='tag' value='" + word + "'></div>";
    html += "      <input class='button' type='button' onclick='dialogs.mediaSearch()' value='Search'/>";				    
    html += "      <div class='clear'></div>";
		html += "    </div>";
    html += "    <div id='media_results'></div>";
    html += "  </div>"
		html += "</div>";
		html += "</form>";
    
    $('dynamic_dialog').style.width = "360px";
		$('dialog_content').innerHTML = html;

		dialogs.showDialog();
    
    $('dialog_attribution').value = attribution; //couldn't get quoting right
    dialogs.mediaChange();
	},
   
  mediaChange:function()
  {
    var r = $('media_radio_picture');
    if (r.checked) {
      var val = $('dialog_media').value;
      if (val != '') {
        $('current_image').innerHTML = "<img width='200' src='" + val + "'>";
        $('image_display').style.display = 'block';
        $('image_search').style.display = 'none';
      } else {
        $('image_display').style.display = 'none';
        $('image_search').style.display = 'block';
      }
    } else {
      $('dialog_media').value = '';
      $('dialog_attribution').value = '';
      $('image_display').style.display = 'none';      
      $('image_search').style.display = 'none';
    }
  },
   
   mediaSearch:function()
   {
     var tags = $('tag').value;    	
     var params = "tags=" + tags;
     
     $('media_results').innerHTML = "<img src='/images/loader.gif'/>"
     
     new Ajax.Updater('media_results', '/admin/media_search?' + params, {asynchronous:true, evalScripts:true});
   },
   
   mediaSet:function(url, attribution)
   {
     $('dialog_media').value = url;
     $('dialog_attribution').value = attribution;
     $('media_results').innerHTML = '';
     dialogs.mediaChange();
   },
	
	addClue:function(dest)
	{
    	var word = $('dialog_word').value;
    	var clue = $('dialog_clue').value;
    	var media = $('dialog_media').value;
      var attribution = $('dialog_attribution').value;
    	var extra_params = $('extra_params').value;
       
      var params = "word=" + word;
      params += "&clue=" + escape(clue);
      params += "&media=" + media;
      params += "&attribution=" + escape(attribution);
      params += "&" + extra_params;
         
      $('dialog_buttons').innerHTML = "<img src='/images/loader.gif'>";
         
      new Ajax.Updater(dest, '/build/add_clue?' + params, {asynchronous:true, evalScripts:true});
	},
	
	recentCluePicker:function()
	{
		var html = "<h4>Your Recently Added Clues</h4>";
		
		recentClues.each(function(clue) { 
			html += "<div>";
			html += "<a href=\"javascript:dialogs.addThemeClue('" + clue.word + "','" + quoteJS(clue.clue) + "')\">" + clue.word + " - " + clue.clue + "</a>";
			html += "</div>";
		});
		
		html += "<div class='dialog_buttonline clearfix'>";
		html += "<input type='button' value='Cancel' name='close' id='close' onclick='dialogs.hideDialog();' class='inputbutton inputaux'/></div>";
		html += "</div>";
		html += "</form>";
		
		$('dialog_content').innerHTML = html;

		dialogs.showDialog();
	},
	
	addThemeClue:function(word,clue)
	{
		var c = new Object;
		c.word = word;
		c.clue = clue;
		themeWords.push(c);
    drawThemeWords();
		
		dialogs.hideDialog();    
	},
	
    onAddedClue:function(newClue)
    {
    	themeWords.push(newClue);
    	drawThemeWords();
		
		dialogs.hideDialog();    
    }
	
}
dialogs = new Dialogs();
