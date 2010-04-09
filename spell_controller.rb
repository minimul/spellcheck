class SpellController < ApplicationController
require 'net/https'
require 'uri'

  def index
    lang = params[:lang] || 'en'
    ignoredigits = params[:ignoredigits] ||= 1
    ignorecaps   = params[:ignorecaps] ||= 1
    # Make sure the there are no line breaks whatsoever and put a <?xml not a <xml and the start
    body = %{<?xml version="1.0" encoding="utf-8" ?><spellrequest textalreadyclipped="0" ignoredups="1" ignoredigits="#{ignoredigits}" ignoreallcaps="#{ignorecaps}"><text>#{params[:text]}</text></spellrequest>}
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
