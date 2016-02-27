-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema scouting2016
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema scouting2016
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `scouting2016` DEFAULT CHARACTER SET utf8 ;
USE `scouting2016` ;

-- -----------------------------------------------------
-- Table `scouting2016`.`matches`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `scouting2016`.`matches` (
  `match_id` INT NOT NULL AUTO_INCREMENT,
  `match_number` INT NOT NULL,
  `match_type` VARCHAR(1) NOT NULL,
  `event_id` INT NOT NULL,
  `red1` INT NOT NULL,
  `red2` INT NOT NULL,
  `red3` INT NOT NULL,
  `blue1` INT NOT NULL,
  `blue2` INT NOT NULL,
  `blue3` INT NOT NULL,
  PRIMARY KEY (`match_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `scouting2016`.`actions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `scouting2016`.`actions` (
  `action_id` INT NOT NULL AUTO_INCREMENT,
  `action_name` VARCHAR(100) NOT NULL,
  `points` INT NULL,
  PRIMARY KEY (`action_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `scouting2016`.`locations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `scouting2016`.`locations` (
  `location_id` INT NOT NULL AUTO_INCREMENT,
  `location_name` VARCHAR(100) NULL,
  PRIMARY KEY (`location_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `scouting2016`.`teams`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `scouting2016`.`teams` (
  `team_number` INT NOT NULL,
  `team_name` VARCHAR(100) NULL,
  PRIMARY KEY (`team_number`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `scouting2016`.`match_actions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `scouting2016`.`match_actions` (
  `match_action_id` INT NOT NULL AUTO_INCREMENT,
  `match_id` INT NOT NULL,
  `action_id` INT NOT NULL,
  `team_number` INT NOT NULL,
  `match_time` INT NOT NULL,
  `location_id` INT NOT NULL,
  `successful` TINYINT(1) NULL,
  `speed` INT NULL,
  PRIMARY KEY (`match_action_id`),
  INDEX `match_fk_idx` (`match_id` ASC),
  INDEX `action_fk_idx` (`action_id` ASC),
  INDEX `location_fk_idx` (`location_id` ASC),
  INDEX `team_fk_idx` (`team_number` ASC),
  CONSTRAINT `match_fk`
    FOREIGN KEY (`match_id`)
    REFERENCES `scouting2016`.`matches` (`match_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `action_fk`
    FOREIGN KEY (`action_id`)
    REFERENCES `scouting2016`.`actions` (`action_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `location_fk`
    FOREIGN KEY (`location_id`)
    REFERENCES `scouting2016`.`locations` (`location_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `team_fk`
    FOREIGN KEY (`team_number`)
    REFERENCES `scouting2016`.`teams` (`team_number`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `scouting2016`.`events`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `scouting2016`.`events` (
  `event_id` INT NOT NULL AUTO_INCREMENT,
  `event_name` VARCHAR(100) NULL,
  PRIMARY KEY (`event_id`))
ENGINE = InnoDB;

CREATE USER 'scouting' IDENTIFIED BY 'robotscout537';

GRANT ALL ON `scouting2016`.* TO 'scouting';

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
