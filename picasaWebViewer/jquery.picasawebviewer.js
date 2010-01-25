
/// <reference path="jquery-1.3.2-vsdoc2.js" />

/*
* picasaWebViewer jQuery Plugin
* Copyright (c) 2010 Elijah Manor
* elijah.manor@gmail.com | http://elijahmanor.com
* Dual licensed under MIT and GPL.
* Updated: 01/09/09
* @author Elijah Manor
* @version 0.1
*/

(function($){
    var tabs, gallery, repository,
    	picasaWebViewer = $.picasaWebViewer = {};
    
    picasaWebViewer.defaultOptions = {
        urlFormat : "http://picasaweb.google.com/data/feed/api/user/{0}?alt=json-in-script",
        albumTitleMaxLength : 15,
        defaultDialogWidth : 600,
        defaultDialogHeight : 400,
        userName : null
    };
        
    picasaWebViewer.options = null;
    
    picasaWebViewer.overrideOptions = function(options) {
        picasaWebViewer.options = $.extend({},picasaWebViewer.defaultOptions, options);
    };
    
    picasaWebViewer.repository = {
		getAlbums : function(callback) {
		    console.group('getAlbums');
		
		    var updatedUrl = picasaWebViewer.options.urlFormat.replace("{0}", picasaWebViewer.options.userName);
		    $.ajax({ 
		        url: updatedUrl,
		        success: function(data) {
		            callback(data.feed.entry); 
		        },
		        dataType: 'jsonp'
		    });
		    
		    console.groupEnd('getAlbums');
		},
		getPhotos : function(url, callback) {
		    console.group('getPhotos');
		    $.ajax({ 
		        url: url,
		        success: function(data) {
		            callback(data.feed.entry);
		        },
		        dataType: 'jsonp'
		    });
		    console.groupEnd('getPhotos');            
		}		    	
    };
    
    picasaWebViewer.scaffoldGallery = function(element) {
        var html = 
            "<div class='demo ui-widget ui-helper-clearfix'>" +                
                "<div id='tabs'>" + 
                    "<ul>" + 
                        "<li><a href='#tabs-0'>Albums</a></li>" + 
                    "</ul>" + 
                    "<div id='tabs-0'>" + 
                        "<ul id='gallery' class='gallery ui-helper-reset ui-helper-clearfix' />" + 
                    "</div>" + 
                "</div>" +                                                                   
            "</div>";
                                          
        tabs = $(html).appendTo(element).find('#tabs').tabs({
            add: function(e, ui) {
                $(ui.tab).parents('li:first')
                    .append("<span style='float: right;' class='ui-icon ui-icon-close' title='Close Tab'></span>")
                    .find('.ui-icon-close')
                    .click(function() {
                        tabs.tabs('remove', $('li', tabs).index($(this).parents('li:first')[0]));
                    });
                    tabs.tabs('select', '#' + ui.panel.id);
                }             
            }            	
        );
        gallery = $('#gallery');
    };
    
    picasaWebViewer.getAndDisplayAlbums = function(element) {
        console.group('getAndDsiplayAlbums');
        picasaWebViewer.scaffoldGallery(element);
        repository.getAlbums(function(albums) {            
            if (albums) {
            	picasaWebViewer.displayAlbums(albums);
            } 
        });
        console.groupEnd('getAndDsiplayAlbums');    		
    }; 
    
    picasaWebViewer.truncateTitle = function(title) {
        return picasaWebViewer.truncate(title, picasaWebViewer.options.albumTitleMaxLength);
    };
    
    picasaWebViewer.truncate = function(source, maximumLength) {
        if (source && source.length > maximumLength) {
            source = source.substring(0, maximumLength - 3) + "...";
        }
        return source;
    };
    
    picasaWebViewer.displayAlbum = function(album) {
        console.group('displayAlbum');
        
        var title = picasaWebViewer.truncateTitle(album.title.$t);
        var html = 
            "<li class='ui-widget-content ui-corner-tr'>" +
                "<h5 class='ui-widget-header'>" + title + "</h5>" +
                "<a><img src='" + album.media$group.media$thumbnail[0].url + "' alt='" + album.title.$t + "' /></a>" +          
            "</li>"; 
                    
        $(html)
            .appendTo(gallery)
            .find("a").attr('href', album.link[0].href)
            .click($.picasaWebViewer.clickAlbum);              
        console.groupEnd('displayAlbum');
    };
    
    picasaWebViewer.clickAlbum = function(event) {
        console.group('clickAlbum');

        var newTabIndex = tabs.tabs("length");
        tabs.tabs("add" , "#tabs-" + newTabIndex, $(this).find("img").attr("alt"), newTabIndex);     
        var newTab = $("#tabs-"+ newTabIndex);
        //tabs.tabs("select", newTabIndex);
        picasaWebViewer.getAndDisplayPhotos(this.href, newTab);           

        console.groupEnd('clickAlbum');            
        return false;                        
    };
    
    picasaWebViewer.displayAlbums = function(albums) {
        console.group('displayAlbums');
        $.each(albums, function() {
            picasaWebViewer.displayAlbum(this);
        });
        console.groupEnd('displayAlbums'); 
    };
    
    picasaWebViewer.getAndDisplayPhotos = function(url, tab) {
        console.group('getAndDisplayPhotos');
        var photoGalleryId = "photos-" + tab.attr("id");
        var photoGallery = $("<ul id='" + photoGalleryId + "' class='gallery ui-helper-reset ui-helper-clearfix' />").appendTo(tab);
        repository.getPhotos(url, function(photos) {
            if (photos) {
                picasaWebViewer.displayPhotos(photos,  photoGallery);
            }            
        });
        console.groupEnd('getAndDisplayPhotos');
    };        
        	
    picasaWebViewer.displayPhotos = function(photos, tabGallery) {
        console.group('displayPhotos');
        $.each(photos, function() {
            picasaWebViewer.displayPhoto(this, tabGallery);
        });
        console.groupEnd('displayPhotos');               
    };
    
    picasaWebViewer.displayPhoto = function(photo, tabGallery) {
        console.group('displayPhoto');
        var group = photo.media$group;

        var title = picasaWebViewer.truncateTitle(group.media$title.$t);
        var html = 
            "<li class='ui-widget-content ui-corner-tr'>" +
                "<h5 class='ui-widget-header'>" + title + "</h5>" +
                "<img src='" + group.media$thumbnail[1].url + "' alt='" + group.media$title.$t + "' />" +
            "</li>"; 

        $(html)
            .data("metadata", {
                url : photo.content.src,
                width : photo.gphoto$width.$t,            		            		
                height : photo.gphoto$height.$t,
                title : group.media$title.$t
            })
            .appendTo(tabGallery)
            .click($.picasaWebViewer.clickPhoto);
        console.groupEnd('displayPhoto');
    };
    
    picasaWebViewer.clickPhoto = function(event) {
        var metadata = $(this).closest('li').data('metadata')
        var scaledSize = picasaWebViewer.scaleSize({
        	maximumWidth : $.picasaWebViewer.options.defaultDialogWidth, 
        	maximumHeight : $.picasaWebViewer.options.defaultDialogHeight, 
        	currentWidth : metadata.width, 
        	currentHeight : metadata.height
    	});
        $('<img />').attr({
            'src' : metadata.url,
            'width' : scaledSize.width,
            'height' : scaledSize.height
        }).dialog({
            bgiframe: true,
            autoOpen: false,
            width: scaledSize.width, 
            height: scaledSize.height + 20, 
            modal: true,
            title: metadata.title
        }).dialog('open');
        
        return false;
    };
    
    picasaWebViewer.scaleSize = function(dimensions) {
        var ratio = dimensions.currentHeight / dimensions.currentWidth;
        
        if (dimensions.currentWidth >= dimensions.maximumWidth) {
            dimensions.currentWidth = dimensions.maximumWidth;
            dimensions.currentHeight = dimensions.currentWidth * ratio;
        } else if (dimensions.currentHeight >= dimensions.maximumHeight) {
            dimensions.currentHeight = dimensions.maximumHeight;
            dimensions.currentWidth = dimensions.currentHeight / ratio;
        }
        
        return {
            width : Math.floor(dimensions.currentWidth),
            height : Math.floor(dimensions.currentHeight)		    
        };
    };

    picasaWebViewer.setJquery = function(object) {
    	$ = object;	
    };
      
    picasaWebViewer.setRepository = function(object) {
    	repository = object;	
    };
    
    picasaWebViewer.setPicasaWebViewer = function(object) {
    	picasaWebViewer = object;	
    };
        
    $.fn.picasaWebViewer = function(options){
    	repository = picasaWebViewer.repository;
        return this.each(function(){            
            picasaWebViewer.overrideOptions(options);            
            picasaWebViewer.getAndDisplayAlbums(this);
        });
    };    
})(jQuery);
