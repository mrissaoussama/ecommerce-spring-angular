package com.bezkoder.springjwt.payload.request;

import jakarta.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class DeleteUserRequest {
  @NotBlank
  private String username;

  @NotBlank
  private String password;
  private Long id;
}
