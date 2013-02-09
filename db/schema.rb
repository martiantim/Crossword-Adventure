# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20130131042514) do

  create_table "answers", :force => true do |t|
    t.integer "x",         :limit => 2
    t.integer "y",         :limit => 2
    t.string  "correct",   :limit => 1
    t.integer "puzzle_id", :limit => 8
  end

  add_index "answers", ["puzzle_id", "x", "y"], :name => "puzzle_id"
  add_index "answers", ["puzzle_id"], :name => "FKCD7DB875B9574C98"

  create_table "answers2", :force => true do |t|
    t.string  "current",     :limit => 1
    t.integer "solution_id", :limit => 8
    t.integer "user_id",     :limit => 8
  end

  add_index "answers2", ["solution_id"], :name => "FKE239565D33888F38"
  add_index "answers2", ["user_id"], :name => "FKE239565D5EAFD4F8"

  create_table "build_items", :force => true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "name",                                        :null => false
    t.integer  "difficulty",                                  :null => false
    t.string   "theme_clues",                                 :null => false
    t.integer  "user_id",                                     :null => false
    t.string   "status",                                      :null => false
    t.string   "size",                                        :null => false
    t.integer  "result"
    t.string   "exclude_categories"
    t.string   "puzzle_type",           :default => "normal", :null => false
    t.string   "theme_category"
    t.integer  "category_id"
    t.string   "max_size"
    t.integer  "top_level_category_id"
    t.datetime "last_build_at"
    t.integer  "build_attempts"
    t.string   "email"
    t.boolean  "paid",                  :default => false,    :null => false
    t.boolean  "notified",              :default => false,    :null => false
  end

  create_table "categories", :force => true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "name",       :null => false
    t.integer  "parent_id"
  end

  create_table "challenges", :force => true do |t|
    t.datetime "start_time"
    t.datetime "end_time"
    t.integer  "puzzle_id",    :limit => 8
    t.string   "kind",                      :default => "solo", :null => false
    t.integer  "turn_user_id"
    t.integer  "elapsed_time",              :default => 0,      :null => false
    t.datetime "startTime"
    t.datetime "endTime"
    t.string   "type"
    t.integer  "user_id",      :limit => 8
  end

  add_index "challenges", ["puzzle_id"], :name => "FK1FB51070B9574C98"
  add_index "challenges", ["user_id"], :name => "FK1FB510705EAFD4F8"

  create_table "cluecomments", :force => true do |t|
    t.datetime "addedDate"
    t.integer  "user_id",   :limit => 8
    t.integer  "clue_id",   :limit => 8
    t.string   "comment"
  end

  add_index "cluecomments", ["clue_id"], :name => "FKCAD6B9AD890CED62"
  add_index "cluecomments", ["user_id"], :name => "FKCAD6B9AD5EAFD4F8"

  create_table "clues", :force => true do |t|
    t.integer  "number",      :limit => 2
    t.integer  "x",           :limit => 2
    t.integer  "y",           :limit => 2
    t.string   "direction",   :limit => 1
    t.integer  "length",      :limit => 2
    t.integer  "wordclue_id", :limit => 8
    t.integer  "puzzle_id",   :limit => 8
    t.string   "kind",        :limit => 1
    t.datetime "solvedTime"
    t.string   "type",        :limit => 1
    t.integer  "user_id",     :limit => 8
    t.string   "turns"
  end

  add_index "clues", ["puzzle_id", "direction", "x", "y"], :name => "puzzle_id"
  add_index "clues", ["puzzle_id"], :name => "FK5A5F2DAB9574C98"
  add_index "clues", ["user_id"], :name => "FK5A5F2DA5EAFD4F8"
  add_index "clues", ["wordclue_id"], :name => "FK5A5F2DA890CED62"

  create_table "cluesolves", :force => true do |t|
    t.datetime "solvedTime"
    t.integer  "user_id",       :limit => 8
    t.integer  "puzzleclue_id", :limit => 8
    t.integer  "challenge_id",  :limit => 8
  end

  add_index "cluesolves", ["challenge_id"], :name => "FK2890D60D74C53A7C"
  add_index "cluesolves", ["puzzleclue_id"], :name => "FK2890D60D4725BB18"
  add_index "cluesolves", ["user_id"], :name => "FK2890D60D5EAFD4F8"

  create_table "customers", :force => true do |t|
    t.string   "name"
    t.datetime "addedDate"
    t.string   "backgroundColor"
    t.string   "themeClueColor"
    t.string   "headerColor"
    t.string   "linkColor"
    t.string   "borderColor"
    t.string   "highlightColor"
    t.string   "block_color"
    t.string   "powered",         :default => "endlesscrossword"
  end

  create_table "guesses", :force => true do |t|
    t.integer  "x",            :limit => 2
    t.integer  "y",            :limit => 2
    t.string   "letter",       :limit => 1
    t.datetime "created_at"
    t.integer  "user_id",      :limit => 8
    t.integer  "puzzle_id",    :limit => 8
    t.integer  "challenge_id", :limit => 8
    t.datetime "timestamp"
  end

  add_index "guesses", ["challenge_id"], :name => "FK160E20C574C53A7C"
  add_index "guesses", ["puzzle_id"], :name => "FK160E20C5B9574C98"
  add_index "guesses", ["user_id"], :name => "FK160E20C55EAFD4F8"

  create_table "helprequests", :force => true do |t|
    t.string  "type"
    t.integer "clue_id",   :limit => 8
    t.integer "asker_id",  :limit => 8
    t.integer "solver_id", :limit => 8
  end

  add_index "helprequests", ["asker_id"], :name => "FKB3E15E05438E99FD"
  add_index "helprequests", ["clue_id"], :name => "FKB3E15E0580EFAD16"
  add_index "helprequests", ["solver_id"], :name => "FKB3E15E052D169BB0"

  create_table "players", :force => true do |t|
    t.integer "user_id",      :limit => 8
    t.integer "challenge_id", :limit => 8
    t.string  "canAsk",       :limit => 1
  end

  add_index "players", ["challenge_id"], :name => "FKE294C1B274C53A7C"
  add_index "players", ["user_id"], :name => "FKE294C1B25EAFD4F8"

  create_table "puzzlecomments", :force => true do |t|
    t.string   "comment"
    t.integer  "rating",    :limit => 2
    t.datetime "addedDate"
    t.integer  "user_id",   :limit => 8
    t.integer  "puzzle_id", :limit => 8
  end

  add_index "puzzlecomments", ["puzzle_id"], :name => "FKDCA39032B9574C98"
  add_index "puzzlecomments", ["user_id"], :name => "FKDCA390325EAFD4F8"

  create_table "puzzles", :force => true do |t|
    t.integer  "width"
    t.integer  "height"
    t.string   "type"
    t.string   "visible"
    t.string   "name"
    t.integer  "numWords"
    t.integer  "numNonblockLetters"
    t.integer  "creator_id",            :limit => 8
    t.datetime "createdate"
    t.string   "status"
    t.string   "category"
    t.string   "puzzle_type",                        :default => "normal", :null => false
    t.boolean  "show_scores",                        :default => true,     :null => false
    t.boolean  "auto_submit",                        :default => true,     :null => false
    t.integer  "category_id"
    t.integer  "top_level_category_id"
    t.string   "complete_text"
    t.string   "url"
  end

  add_index "puzzles", ["creator_id"], :name => "FKF35137F5B9ABD8F7"

  create_table "scores", :force => true do |t|
    t.integer  "score",                          :default => 0, :null => false
    t.integer  "words_completed",                :default => 0, :null => false
    t.integer  "user_id",                                       :null => false
    t.integer  "challenge_id",                                  :null => false
    t.integer  "letters_completed",              :default => 0, :null => false
    t.integer  "time"
    t.integer  "letters_wrong",                  :default => 0, :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "wordsCompleted"
    t.integer  "lettersCompleted"
    t.integer  "lettersWrong"
    t.integer  "puzzle_id",         :limit => 8
  end

  add_index "scores", ["challenge_id"], :name => "FKC9E4942174C53A7C"
  add_index "scores", ["puzzle_id"], :name => "FKC9E49421B9574C98"
  add_index "scores", ["user_id"], :name => "FKC9E494215EAFD4F8"

  create_table "sessions", :force => true do |t|
    t.string   "session_id", :null => false
    t.text     "data"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "sessions", ["session_id"], :name => "index_sessions_on_session_id"
  add_index "sessions", ["updated_at"], :name => "index_sessions_on_updated_at"

  create_table "solutions", :force => true do |t|
    t.integer "x",         :limit => 2
    t.integer "y",         :limit => 2
    t.string  "correct",   :limit => 1
    t.integer "puzzle_id", :limit => 8
  end

  add_index "solutions", ["puzzle_id"], :name => "FKC4BC621AB9574C98"

  create_table "users", :force => true do |t|
    t.integer  "fb_id",             :limit => 8
    t.string   "first_name"
    t.string   "fb_session"
    t.datetime "lastLogin"
    t.string   "email"
    t.string   "password"
    t.string   "last_user_agent"
    t.string   "ip"
    t.integer  "primary_puzzle_id"
    t.string   "powers"
    t.boolean  "show_instructions",              :default => true, :null => false
    t.datetime "created_at",                                       :null => false
    t.datetime "joindate"
    t.string   "lastUserAgent"
    t.string   "firstName"
    t.integer  "karma"
  end

  create_table "wordclues", :force => true do |t|
    t.string   "clue"
    t.datetime "created_at"
    t.integer  "user_id",             :limit => 8
    t.integer  "word_id",             :limit => 8
    t.string   "status",              :limit => 1
    t.integer  "difficulty"
    t.string   "category"
    t.string   "kind"
    t.integer  "explain_user_id",     :limit => 8
    t.datetime "updated_at"
    t.integer  "original_difficulty"
    t.string   "attribution",         :limit => 1024
    t.string   "media"
  end

  add_index "wordclues", ["explain_user_id"], :name => "FK35430210293A59B0"
  add_index "wordclues", ["user_id"], :name => "FK354302105EAFD4F8"
  add_index "wordclues", ["word_id"], :name => "FK35430210C25A9898"

  create_table "words", :force => true do |t|
    t.string  "word"
    t.string  "parts_of_speech", :limit => 6
    t.integer "frequency"
    t.integer "min_difficulty"
    t.integer "max_difficulty"
  end

  add_index "words", ["word"], :name => "word_index"

end
