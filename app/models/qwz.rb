class Qwz
  
  def self.read
    
    doc = Nokogiri::HTML(open('qwz/1.html'))
    
    puz = Puzzle.new(:name => "test")
    width = 0
    height = 0
    puz.save!
    doc.css(".lt").each do |item|
      style = item.attr('style')
      if style =~ /left\:(\d+)px/
        left = $1.to_i        
      end
      if style =~ /top\:(\d+)px/
        top = $1.to_i
      end
      
      x = (left-1)/36
      y = (top-5)/36
      width = x+1 if x >= width
      height = y+1 if y >= height
      
      letter = item.text
      letter = '*' if letter == ' '
            
      puz.answers.create(:x => x, :y => y, :correct => letter)
    end
    
    puz.update_attributes!(:width => width, :height => height)
    
    
    puts puz.letter_grid
    
    clues = ClueFinder.new(puz).find!
    clues.each do |c|
      word = puz.letter_grid.pattern(c)
      w = Word.find_by_word(word)
      if !w
        puts "Can't find #{word}"
        raise StandardError, "Foo"
      end

      wc = w.find_easy_clue
      if !wc
        puts "Can't finda any clues for #{word} (#{w.id})"
        p c
        raise StandardError, "hi"
      end
      c.wordclue_id = wc.id
      
      puz.clues << c
    end
  end
  
end


#url = "http://www.walmart.com/search/search-ng.do?search_constraint=0&ic=48_0&search_query=batman&Find.x=0&Find.y=0&Find=Find"
#doc = Nokogiri::HTML(open(url))
#puts doc.at_css("title").text
#doc.css(".item").each do |item|
#  title = item.at_css(".prodLink").text
#  price = item.at_css(".PriceCompare .BodyS, .PriceXLBold").text[/\$[0-9\.]+/]
#  puts "#{title} - #{price}"
#  puts item.at_css(".prodLink")[:href]
#end
