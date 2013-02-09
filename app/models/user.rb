class User < ActiveRecord::Base
  
  def is_admin?
    false
  end
  
end