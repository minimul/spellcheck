/*  SpellCheck is written by Christian Pelczarski
 *  and is freely distributable under the terms of an MIT-style license.
/*--------------------------------------------------------------------------*/

var SpellCheck = Class.create({
  initialize:function(element,link,options){
	  this.element = $(element);
    this.link = $(link);
	  this.options = Object.extend({
      lang: 'en',
      url: '/spell',
      ignorecaps: 1,
      ignoredigits: 1,
      method: 'post',
      editLinkContent: 'check spelling',
      editLinkClassName: 'spellCheckEdit',
      stopLinkContent: 'stop checking',
      stopLinkClassName: 'spellCheckStop',
      checkingLinkContent: ' checking, wait..'
	  }, options);
    this.createEditingLink();
  },
  overlay: function(){
    this.div = new Element('div',{ 'class':'spellCheckOverlay' });
    // .clonePosition doesn't work if is textarea is scrolled
    // set the overlay manually
    var cum = this.element.cumulativeOffset();
    var dim = this.element.getDimensions();
    this.div.setStyle({ position:'absolute', top: cum.top + 'px',left: cum.left + 'px',width: dim.width + 'px', height: dim.height + 'px' });
    this.div.update(this.toHtml());
    this.div.select('a').invoke('observe','click',this.suggestionMenu.bindAsEventListener(this));
    $(document.body).insert(this.div);
    this.createStopCheckingLink();

  },
  toHtml: function(){
    var str = this.text;
    var res = this.res;
    str = str.gsub(/(\w|')+/,function(match){ 
       if(w = res.find(function(r){ if(r.get('word') == match[0]) return true; })){
        return '<a href="#" data="#{s}">#{m}</a>'.interpolate({ m: match[0], s: w.get('suggestions').join(',') })
       }else{
        return match[0];
       }
    });
    str = str.gsub("\n",'<br/>');
    str = str.gsub(/\s(?![^<]*>)/,'&nbsp;');    
    return str;
  },
  createEditingLink: function(){
    var a = new Element('a',{ href:'#','class': this.options.editLinkClassName }).update(this.options.editLinkContent);
    a.observe('click',this.check.bindAsEventListener(this));
    this.link.update();
    this.link.insert(a);
  },
  check: function(event){
    this.link.insert({ after: '<span class="spellCheckWait">#{content}</span>'.interpolate({ content: this.options.checkingLinkContent }) });
    event.stop();
    this.text = $F(this.element);
    this.send();
  },
  createStopCheckingLink: function(){
    var a = new Element('a',{ href:'#','class': this.options.stopLinkClassName }).update(this.options.stopLinkContent);
    a.observe('click',this.stopChecking.bindAsEventListener(this));
    this.link.update();
    this.link.insert(a);
  },
  stopChecking: function(event){
    event.stop();
    var str = this.html2TextArea(); 
    this.element.value = str;
    this.div.remove();
    this.createEditingLink();
  },
  html2TextArea: function(){
    var html = this.div.innerHTML;
    html = html.gsub('&nbsp;',' ');
    html = html.gsub(/<br>/i,"\n");
    html = html.stripTags();
    return html;
  },
	send: function(){
    new Ajax.Request(this.options.url, 
        { parameters: Object.extend({ text: this.text },this.options), 
          method: this.options.method,
          onComplete: function(r){ 
            this.link.next().remove();
            this.parseResults(r)
          }.bind(this) 
    });
	},
	parseResults: function(results) {
    var c = results.responseXML.getElementsByTagName('c');
    var corrections = $A(c);
    if(!corrections.size()){
      this.link.insert({ after: '<span class="spellCheckNoErrors">No spelling errors</span>' });
      (function(){ this.link.next().remove(); }.bind(this)).delay(1);
      return null;
    }
    this.res = $A();
    corrections.each(function(node){
      sugg = node.childNodes[0].nodeValue;
      offset = node.attributes[0].nodeValue;
      len = node.attributes[1].nodeValue;
			this.res.push(
        $H({
          word: this.text.substr(offset, len),
          suggestions: sugg.split(/\s/)
			  })
      );
    },this);
    this.overlay();
	},
  suggestionMenu: function(event){
    event.stop();
    this.misSpelling = event.target;
    var p = event.pointer();
    // Make sure the suggestionMenu is properly destroy before making a new one
    if(Object.isElement(this.m)){ 
      this.m.remove();
    }
    this.m = new Element('ul',{ 'class': 'spellCheckSuggestionMenu' });
    var sugg = this.misSpelling.readAttribute('data').split(',');
    //console.log(p);
    sugg.each(function(s){
      this.m.insert({ bottom: '<li>' + s + '</li>' });
    },this);
    this.m.select('li').invoke('observe','click',this.selectSuggestion.bindAsEventListener(this))
                       .invoke('observe','mouseover',function(){ this.setStyle({ background: '#ff9' }) } )
                       .invoke('observe','mouseout',function(){ this.setStyle({ background: 'white' }) } );

    this.m.setStyle({ position:'absolute',top: p.y + 'px', left: p.x + 'px' });
    $(document.body).insert(this.m);
    this.csm = this.closeSuggestionMenu.bind(this);
    this.div.observe('click',this.csm);
    //console.log(targ.getAttribute('data'));
    //this.suggestionMenu();
  },
  selectSuggestion: function(event){
    var targ = event.target;
    var sugg = targ.innerHTML;
    this.misSpelling.update(sugg);
    this.misSpelling.setStyle({ background: 'white',color: 'black' });
    this.m.remove();
    // Always delete this.m instance variable after removing it
    delete this.m
  },
  closeSuggestionMenu: function(){
    //console.log('hit closeSuggestionMenu');
    this.m.remove();
    delete this.m
    this.div.stopObserving('click',this.csm);
  }

});

Element.addMethods({
  checkSpelling: function(element,link,options){
    element = $(element);
    new SpellCheck(element,link,options);
    return element;
  }
});
