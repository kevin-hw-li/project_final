class SessionsController < ApplicationController

  def new
  end

  def create
    user = User.find_by_email(params[:email])
    if user.present? && user.authenticate(params[:password])
      session[:user_id] = user.id
      redirect_to root_path
      flash[:success] = "You have successfully signed in."
    else
      flash[:error] = "Something went wrong. Please try again."
      render :new
    end
  end

  def destroy
    session.delete(:user_id)
    redirect_to root_path
    flash[:success] = "You have successfully signed out."
  end

end
