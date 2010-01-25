
var oldJquery = null;
$(function() {
    oldJquery = window.jQuery;
});
oldPicasaWebViewer = $.picasaWebViewer;

module("Picasa Web Viewer", {
    setup: function() {   
    	$(targetId).empty(); 	
    	$(".ui-widget, .ui-widget-overlay").remove();
    	$.picasaWebViewer.overrideOptions({});
    },
    teardown: function() {
        $.picasaWebViewer.setJquery(oldJquery);
        $.picasaWebViewer.setPicasaWebViewer(oldPicasaWebViewer);	        
    }
});

test("Default Options", function() {
	//Assert
    same($.picasaWebViewer.defaultOptions.urlFormat, 'http://picasaweb.google.com/data/feed/api/user/{0}?alt=json-in-script');
    same($.picasaWebViewer.defaultOptions.albumTitleMaxLength, 15);
    same($.picasaWebViewer.defaultOptions.defaultDialogWidth, 600);
    same($.picasaWebViewer.defaultOptions.defaultDialogHeight, 400); 
});

test("Override Deafult Options", function() {
	//Act
    $.picasaWebViewer.overrideOptions({
        urlFormat : 'http://www.google.com',
        albumTitleMaxLength : 25,
        defaultDialogWidth : 400,
        defaultDialogHeight : 300,
        userName : 'BillGates'   	
    });
    
    //Assert
    same($.picasaWebViewer.options.urlFormat, 'http://www.google.com');	
    same($.picasaWebViewer.options.albumTitleMaxLength, 25);	
    same($.picasaWebViewer.options.defaultDialogWidth, 400);	
    same($.picasaWebViewer.options.defaultDialogHeight, 300);	
    same($.picasaWebViewer.options.userName, 'BillGates');	
});

test("Scafford Gallery", function() {
	//Act
	$.picasaWebViewer.scaffoldGallery($(targetId));
	
	//Assert
	ok($(targetId).find('#gallery').length, 'Gallery created');
	ok($(targetId).find('#tabs').length, 'Tabs created');
});

test("GetAndDisplayAlbums Returns Nothing so No Albums Displayed", function() {
	//Arrange
	var target = $(targetId)[0];		
	var mockRepository = new Mock();
	mockRepository  
		.expects(1)
		.method('getAlbums')
		.withArguments(Function)
		.callFunctionWith(null);
		
	var mockPicasaWebViewer = new Mock();
	mockPicasaWebViewer  
		.expects(1)
		.method('scaffoldGallery')
		.withArguments(target);
	mockPicasaWebViewer  
		.expects(0)
		.method('displayAlbums');
	    	  
    $.picasaWebViewer.setRepository(mockRepository);   
    $.picasaWebViewer.setPicasaWebViewer(mockPicasaWebViewer);    
    
    //Act
    $.picasaWebViewer.getAndDisplayAlbums(target);
    
    //Assert
	ok(mockRepository.verify(), 'Verify getAlbums was called'); 
	ok(mockPicasaWebViewer.verify(), 'Verify displayAlbums was not called'); 
});

var testAlbum = {
	title : {
		$t : "myTitle"
	},
	media$group : {
		media$thumbnail : [{url : "http://www.google.com/image.png"}]
	},
	link: [{href : "http://www.google.com"}]
};
	
test("GetAndDisplayAlbums Returns Something so Albums Displayed", function() {
	//Arrange
	var target = $(targetId)[0];
	var mockRepository = new Mock();
	mockRepository  
		.expects(1)
		.method('getAlbums')
		.withArguments(Function)
		.callFunctionWith([testAlbum]);
		
	var mockPicasaWebViewer = new Mock();
	mockPicasaWebViewer  
		.expects(1)
		.method('scaffoldGallery')
		.withArguments(target);
	mockPicasaWebViewer  
		.expects(1)
		.method('displayAlbums')
		.withArguments([testAlbum]);

    $.picasaWebViewer.setRepository(mockRepository);   
    $.picasaWebViewer.setPicasaWebViewer(mockPicasaWebViewer); 
    
    //Act
    $.picasaWebViewer.getAndDisplayAlbums(target);

	//Assert
	ok(mockRepository.verify(), 'Verify getAlbums was called & returned something'); 
	ok(mockPicasaWebViewer.verify(), 'Verify displayAlbums was called'); 
});	

test("GetAlbums Repository", function() {
	//Arrange	
    $.picasaWebViewer.overrideOptions({
        urlFormat : 'http://www.google.com/{0}',
        userName : 'BillGates'   	
    })	    
   
    var mockJquery = new Mock();
     mockJquery
        .expects(1)
        .method('ajax')
        .withArguments({
            url: 'http://www.google.com/BillGates',
            success: Function,
            dataType: "jsonp" 
        })
        .callFunctionWith({ feed : { entry : "data response" }});
    
    $.picasaWebViewer.setJquery(mockJquery);
    
    //Act
    var albums = null;
    $.picasaWebViewer.repository.getAlbums(function(data) {
		albums = data;    	
    });    
    
    //Assert
    ok(albums, "Album Data Was Returned");
    same(albums, "data response");
    ok(mockJquery.verify(), 'Verify ajax was called'); 
});

test("Display Albums", function() {
	//Arrange
	var mockPicasaWebViewer = new Mock();
	mockPicasaWebViewer  
		.expects(2)
		.method('displayAlbum')
		.withArguments(testAlbum);	
    $.picasaWebViewer.setPicasaWebViewer(mockPicasaWebViewer); 
    
    //Act
    $.picasaWebViewer.displayAlbums([testAlbum, testAlbum]); 
    
    //Assert
    ok(mockPicasaWebViewer.verify(), 'Verify displayAlbum was called twice'); 
});

test("Display Album", function() {
	//Arrange
	$.picasaWebViewer.scaffoldGallery($(targetId)[0]); 	
	 
	//Act
	$.picasaWebViewer.displayAlbum(testAlbum); 

	//Assert
	ok($('#gallery').find('li.ui-widget-content').length, 'Found listitem');	
	ok($('#gallery').find('h5').text() === testAlbum.title.$t, 'Title matches');
	ok($('#gallery').find('img').attr('src') === testAlbum.media$group.media$thumbnail[0].url, 'Thumbnail Url matches');
});

test("Click Album", function() {
	//Arrange
	$.picasaWebViewer.scaffoldGallery($(targetId)[0]); 	
	$.picasaWebViewer.displayAlbum(testAlbum);
	var mockPicasaWebViewer = new Mock();
	mockPicasaWebViewer  
		.expects(1)
		.method('getAndDisplayPhotos')
		.withArguments('http://www.google.com', Object);							
    $.picasaWebViewer.setPicasaWebViewer(mockPicasaWebViewer); 		    	
	
	//Act
	$("#gallery li a").trigger('click');

	//Assert
	ok($('#tabs').tabs('length') > 1, 'New Tab Was Added');	
	ok($('#tabs').find('.ui-tabs-selected a span').text() === testAlbum.title.$t, 'Title Correct');			
	ok(mockPicasaWebViewer.verify(), 'Verify getAndDisplayPhotos was called'); 
});

test("Remove Album", function() {
	//Arrange
	$.picasaWebViewer.scaffoldGallery($(targetId)[0]); 	
	$.picasaWebViewer.displayAlbum(testAlbum); 
	
	var mockPicasaWebViewer = new Mock();	  
	mockPicasaWebViewer  
		.expects(1)
		.method('getAndDisplayPhotos')
		.withArguments('http://www.google.com', Object);							
    $.picasaWebViewer.setPicasaWebViewer(mockPicasaWebViewer); 		
  	$("#gallery li a").trigger('click');
	var tabsLength =  $('#tabs').tabs('length');
  	
	//Act
	$(".ui-icon-close").trigger('click');

	//Assert
	ok($('#tabs').tabs('length') + 1 === tabsLength, 'Old Tab Length Greater Than Current Tab Length');
	ok($('#tabs').tabs('length') === 1, 'Deleted Tab');	
	ok(mockPicasaWebViewer.verify(), 'Verify getAndDisplayPhotos was called'); 
});

var testPhoto = {
    media$group : {
    	media$title : {
    		$t : 'varMyTitle'
    	},
    	media$thumbnail : [{url: "http://www.google.com/image0.png"}, {url : "http://www.google.com/image1.png"}],
    },        
    gphoto$width : {
    	$t : 600
    },
    gphoto$height: {
    	$t : 400
    },
    content : {
    	src : "http://www.google.com/imageBig.png"
    }
};

test("Get And Display Photos", function() {
	//Arrange
	$.picasaWebViewer.scaffoldGallery($(targetId)[0]); 	
	$.picasaWebViewer.displayAlbum(testAlbum);
	$("#tabs").tabs("add", "#testTab", "myTitle");  
	
	var mockRepository = new Mock();
	mockRepository  
		.expects(1)
		.method('getPhotos')
		.withArguments('http://www.google.com', Function)
		.callFunctionWith([testPhoto]);
		
	var mockPicasaWebViewer = new Mock();
	mockPicasaWebViewer  
		.expects(1)
		.method('displayPhotos')
		.withArguments([testPhoto]);

    $.picasaWebViewer.setRepository(mockRepository);   
    $.picasaWebViewer.setPicasaWebViewer(mockPicasaWebViewer); 
    
    //Act
    $.picasaWebViewer.getAndDisplayPhotos('http://www.google.com', $("#testTab"));

    //Assert
	ok(mockRepository.verify(), 'Verify getAlbums was called & returned something'); 
	ok(mockPicasaWebViewer.verify(), 'Verify displayAlbums was called'); 
});

test("Display Photos", function() {	
	//Arrange
	var mockPicasaWebViewer = new Mock();
	mockPicasaWebViewer  
		.expects(2)
		.method('displayPhoto')
		.withArguments(testPhoto);	
    $.picasaWebViewer.setPicasaWebViewer(mockPicasaWebViewer); 
    
    //Act
    $.picasaWebViewer.displayPhotos([testPhoto, testPhoto]); 
    
    //Assert
    ok(mockPicasaWebViewer.verify(), 'Verify displayAlbum was called twice'); 		
});

test("Display Photo", function() {	
	//Arrange
	$.picasaWebViewer.scaffoldGallery($(targetId)[0]); 	
	$.picasaWebViewer.displayAlbum(testAlbum);
	$("#tabs").tabs("add", "#testTab", "myTitle");  
	 
	//Act
	$.picasaWebViewer.displayPhoto(testPhoto, $("#testTab")); 

	//Assert
	ok($('#testTab').find('li.ui-widget-content').length, 'Found listitem');	
	ok($('#testTab').find('h5').text() === testPhoto.media$group.media$title.$t, 'Title matches');
	ok($('#testTab').find('img').attr('src') === testPhoto.media$group.media$thumbnail[1].url, 'Thumbnail Url matches');		
});

test("Click Photo", function() {
	//Arrange		 						
    $.picasaWebViewer.scaffoldGallery($(targetId)[0]); 	
	$.picasaWebViewer.displayAlbum(testAlbum);
	$("#tabs").tabs("add", "#testTab", "myTitle").find("#testTab").append("<ul id='testPhoto' class='gallery ui-helper-reset ui-helper-clearfix' />");  
    $.picasaWebViewer.displayPhoto(testPhoto, $("#testTab ul"));

	var mockPicasaWebViewer = new Mock();
	mockPicasaWebViewer  
		.expects(1)
		.method('scaleSize')
		.withArguments({
        	maximumWidth : 1024, 
        	maximumHeight : 768, 
        	currentWidth : 600, 
        	currentHeight : 400
    	})
    	.returns({width: 600, height: 400});										
    $.picasaWebViewer.setPicasaWebViewer(mockPicasaWebViewer); 		    	
    		
	//Act
	$("#testPhoto li").trigger('click');

	//Assert	
	ok(mockPicasaWebViewer.verify(), 'Verify scaleSize was called'); 
});	

test("GetPhotos Repository", function() {	
	//Arrange
    var mockJquery = new Mock();             
     mockJquery
        .expects(1)
        .method('ajax')
        .withArguments({
            url: String,
            success: Function,
            dataType: "jsonp" 
        })
        .callFunctionWith({ feed : { entry : "data response" }});
    
    $.picasaWebViewer.setJquery(mockJquery);
    
    //Act
    var photos = null;
    $.picasaWebViewer.repository.getPhotos(null, function(data) {
		photos = data;    	
    });    
    
    //Assert
    ok(photos, "photos != null");
    same(photos, "data response");
});

test("Scale Size", function() {
	//Act
    var scaledSize = $.picasaWebViewer.scaleSize({
    	maximumWidth : 400, 
    	maximumHeight : 600, 
    	currentWidth : 400, 
    	currentHeight : 600
	});	
	//Assert
	same(scaledSize.width, 400);
	same(scaledSize.height, 600);
	
	//Act
	scaledSize = $.picasaWebViewer.scaleSize({
    	maximumWidth : 400, 
    	maximumHeight : 600, 
    	currentWidth : 500, 
    	currentHeight : 600
	});	
	//Assert	
	same(scaledSize.width, 400);
	same(scaledSize.height, 480);

	//Act
	scaledSize = $.picasaWebViewer.scaleSize({
    	maximumWidth : 400, 
    	maximumHeight : 600, 
    	currentWidth : 600, 
    	currentHeight : 400
	});
	//Assert		
	same(scaledSize.width, 400);
	same(scaledSize.height, 266);
	
	//Act
	scaledSize = $.picasaWebViewer.scaleSize({
    	maximumWidth : 400, 
    	maximumHeight : 600, 
    	currentWidth : 300, 
    	currentHeight : 800
	});	
	//Assert	
	same(scaledSize.width, 225);
	same(scaledSize.height, 600);	
});

test("Truncate", function() {
	//Act
	var truncated = $.picasaWebViewer.truncate('short text', 15);
	//Assert
	same(truncated, 'short text');

	//Act
	truncated = $.picasaWebViewer.truncate('1234567890123', 15);
	//Assert
	same(truncated, '1234567890123');

	//Act	
	truncated = $.picasaWebViewer.truncate('123456789012345', 15);
	//Assert	
	same(truncated, '123456789012345');

	//Act
	truncated = $.picasaWebViewer.truncate('123456789012345678', 15);
	//Assert	
	same(truncated, '123456789012...');
	
	//Act	
	truncated = $.picasaWebViewer.truncate('longer than fifteen', 15);
	//Assert	
	same(truncated, 'longer than ...');

	//Act
	truncated = $.picasaWebViewer.truncate('Really long text that we definately wanted truncated', 15);
	//Assert	
	same(truncated, 'Really long ...');	
});

test("Truncate Title", function() {
	//Act
	var truncated = $.picasaWebViewer.truncateTitle('short');
	//Assert
	same(truncated, 'short');

	//Act
	truncated = $.picasaWebViewer.truncateTitle('123456789012345');
	//Assert
	same(truncated, '123456789012345');
	
	//Act
	truncated = $.picasaWebViewer.truncateTitle('123456789012345678');
	//Assert
	same(truncated, '123456789012...');

	//Act
	truncated = $.picasaWebViewer.truncateTitle('123456789012345678');
	//Assert
	same(truncated, '123456789012...');		

	//Arrange
    $.picasaWebViewer.overrideOptions({
        albumTitleMaxLength : 10,
    });
    
    //Act
	var truncated = $.picasaWebViewer.truncateTitle('short');
	//Assert
	same(truncated, 'short');

	//Act
	truncated = $.picasaWebViewer.truncateTitle('1234567890');
	//Assert
	same(truncated, '1234567890');
	
	//Act
	truncated = $.picasaWebViewer.truncateTitle('1234567890123');
	//Assert
	same(truncated, '1234567...');

	//Act
	truncated = $.picasaWebViewer.truncateTitle('123456789012345678');
	//Assert
	same(truncated, '1234567...');		
});

test("Call Plug-in", function() {
	//Arrange
	var mockPicasaWebViewer = new Mock();	  
	mockPicasaWebViewer  
		.expects(1)
		.method('getAndDisplayAlbums')
		.withArguments($(targetId)[0]);
	mockPicasaWebViewer  
		.expects(1)
		.method('overrideOptions')
		.withArguments({});
    $.picasaWebViewer.setPicasaWebViewer(mockPicasaWebViewer); 	

	//Act
	$(targetId).picasaWebViewer({
		userName : "elijah.manor"
	});
	
	//Assert
	ok(mockPicasaWebViewer.verify(), 'Verify overrideOptions & getAndDisplayAlbums called'); 
});

