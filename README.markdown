# Because Internet Explorer still doesn't have spell check

It doesn't even look like IE 9 is going to have it.

### Earth to Internet Explorer
Built-in browser spell check has got to be one top five recent history browser innovations and I might even place it second to tabbed browsing itself. Built-in or native spell check on input fields is indispensable and can you believe at the time of this writing it doesn't look as if IE 9 is going to have it. I thought for sure it was going to be in IE 8 after the success it had in Firefox 2. Anyway, <a href="http://simplton.com">Simpltonians</a> can not do without spell check in Internet Explorer. For a long time Simplton used <a href="http://orangoo.com/labs/GoogieSpell/" target="_blank">Googiespell</a> for this; however, when <a href="http://simplton.com" target="_blank">Simplton</a> went live I tried to get a paid license but the owner never got back to me. I looked for some other spellcheckers but it seems like everyone has abandon this widget because only IE doesn't have native spell check. All the ones I looked for at the end of 2009 weren't even close to Googiespell in functionality.

### Birth of SpellCheck class
Therefore, I coded up a new spell checker. This spell checker is meant only to be used with Internet Explorer and I haven't done any extensive testing in other browsers. Moreover, it runs off of Google's spell check engine located in the cloud at https://google.com/tbproxy/spell.

### Usage
First, grab the code from <a href="http://github.com/minimul/spellcheck" target="_blank">from its github repo</a>

### HTML and JS
<pre>
<code class="html">
&lt;!DOCTYPE html PUBLIC &quot;-//W3C//DTD XHTML 1.0 Transitional//EN&quot;
  &quot;http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd&quot;&gt;

&lt;html xmlns=&quot;http://www.w3.org/1999/xhtml&quot; xml:lang=&quot;en&quot; lang=&quot;en&quot;&gt;
  &lt;head&gt;
    &lt;title&gt;Spellcheck class demo&lt;/title&gt;
    &lt;script src=&quot;http://ajax.googleapis.com/ajax/libs/prototype/1.6.1.0/prototype.js&quot; type=&quot;text/javascript&quot;&gt;&lt;/script&gt;
    &lt;script src=&quot;spellcheck.js&quot; type=&quot;text/javascript&quot;&gt;&lt;/script&gt;
  &lt;style&gt;
    div.spellCheckOverlay { background:white;border:1px solid #7F9DB9;overflow:auto;word-wrap:break-word; }
    div.spellCheckOverlay a { background:yellow;text-decoration:none; }
    ul.spellCheckSuggestionMenu { border:1px solid #7F9DB9;background:white; }
    ul.spellCheckSuggestionMenu li { cursor:pointer; }
    span.spellCheckNoErrors { background:red;color:white;padding:4px;margin-left:7px; }
    span.spellCheckWait { padding:4px;margin-left:7px; }
    a.spellCheckStop { color:red;font:400 8pt Tahoma; }

  &lt;/style&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;div id=&quot;commentTitleRow&quot;&gt;
      &lt;!--[if IE]&gt;
      &lt;span class=&quot;spellCheckAction&quot; id=&quot;spellCheckForItemComment&quot;&gt;
      &lt;/span&gt;
      &lt;![endif]--&gt;
     &lt;/div&gt;
     &lt;div class=&quot;row&quot;&gt;
        &lt;textarea id=&quot;item_comment&quot; name=&quot;item[comment]&quot; rows=&quot;20&quot; cols=&quot;50&quot;&gt;&lt;/textarea&gt;
     &lt;/div
    &lt;script&gt;
      document.observe( 'dom:loaded',function(){
        // Spell check -- only for IE
        if(Prototype.Browser.IE){
          $('item_comment').checkSpelling('spellCheckForItemComment',{ editLinkClassName: 'spellCheckLink', url: 'spell' });
        }
      });
    &lt;/script&gt;
  &lt;/body&gt;
&lt;/html&gt;

</code></pre>

### Backend
For Rails but should be easy to convert to another backend.
<pre>
<code class="ruby">
class SpellController < ApplicationController
require 'net/https'
require 'uri'

  def index
    lang = params[:lang] || 'en'
    ignoredigits = params[:ignoredigits] ||= 1
    ignorecaps   = params[:ignorecaps] ||= 1
    # Make sure the there are no line breaks whatsoever and put a &lt;?xml not a &lt;xml and the start
    body = %{&lt;?xml version=&quot;1.0&quot; encoding=&quot;utf-8&quot; ?&gt;&lt;spellrequest textalreadyclipped=&quot;0&quot; ignoredups=&quot;1&quot; ignoredigits=&quot;#{ignoredigits}&quot; ignoreallcaps=&quot;#{ignorecaps}&quot;&gt;&lt;text&gt;#{params[:text]}&lt;/text&gt;&lt;/spellrequest&gt;}
    url = 'https://www.google.com'
    parcel = '/tbproxy/spell?lang=' + lang
    uri = URI.parse(url)
    http = Net::HTTP.new(uri.host,uri.port)
    http.use_ssl = true

    res = http.start do |http|
      http.post(parcel,body)
    end
    render :xml => res.body
  end

end

</code></pre>
