class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  before_action :fetch_user

  def fetch_user
    @current_user = User.find_by_id(session[:user_id])
  end

  def authenticate_user
    if @current_user.nil?
      redirect_to root_path
      flash[:error] = "Please sign in to continue."
    end
  end

end
