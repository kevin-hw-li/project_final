class UsersController < ApplicationController

  def new
    @user = User.new
  end

  def create
    @user = User.create(clean_params)
    if @user.save
      session[:user_id] = @user.id
      redirect_to root_path
      flash[:success] = "Your account is created."
    else
      flash[:error] = "Something went wrong. Please try again."
      render :new
    end
  end

  private

  def clean_params
    params.require(:user).permit(:email, :password)
  end

end
