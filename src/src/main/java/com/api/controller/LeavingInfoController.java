package com.api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.dto.LeavingInfoDto;
import com.api.entity.LeavingInfo;
import com.api.entity.School;
import com.api.entity.Student;
import com.api.service.LeavingInfoService;
import com.api.service.SchoolService;
import com.api.service.StudentService;

@RestController
@RequestMapping("/leavinginfo")
public class LeavingInfoController {

	@Autowired
	private LeavingInfoService leavingInfoService;

	@Autowired
	private StudentService studentService;

	@Autowired
	private SchoolService schoolService;

	@PostMapping("/")
	public ResponseEntity<LeavingInfo> savedata(@RequestBody LeavingInfoDto leavingInfoDto) {
		LeavingInfo leavingInfo = new LeavingInfo();
		leavingInfo.setStudentId(studentService.getbyid(leavingInfoDto.getStudentId()));
		leavingInfo.setSchoolUdise(schoolService.getbyid(leavingInfoDto.getSchoolUdise()));
		leavingInfo.setProgress(leavingInfoDto.getProgress());
		leavingInfo.setBehavior(leavingInfoDto.getBehavior());
		leavingInfo.setDateOfLeavingSchool(leavingInfoDto.getDateOfLeavingSchool());
		leavingInfo.setReasonOfLeavingSchool(leavingInfoDto.getReasonOfLeavingSchool());
		leavingInfo.setRemark(leavingInfoDto.getRemark());
		leavingInfo.setLcNumber(leavingInfoDto.getLcNumber());
		leavingInfo.setLcDate(leavingInfoDto.getLcDate());
		leavingInfo.setOtherRemark(leavingInfoDto.getOtherRemark());
		leavingInfo.setCreatedAt(leavingInfoDto.getCreatedAt());

		LeavingInfo saveLeavingInfo = leavingInfoService.post(leavingInfo);

		return new ResponseEntity<LeavingInfo>(saveLeavingInfo, HttpStatus.CREATED);
	}

	@GetMapping("/")
	public ResponseEntity<List<LeavingInfo>> getdata() {
		List<LeavingInfo> leavingInfo = leavingInfoService.getdata();
		return new ResponseEntity<List<LeavingInfo>>(leavingInfo, HttpStatus.OK);
	}

	@GetMapping("/{id}")
	public ResponseEntity<LeavingInfo> getbyidData(@PathVariable long id) {
		LeavingInfo leavingInfo = leavingInfoService.getbyid(id);

		return new ResponseEntity<LeavingInfo>(leavingInfo, HttpStatus.OK);
	}

	@PutMapping("/{id}")
	public ResponseEntity<LeavingInfo> editdata(@PathVariable long id, @RequestBody LeavingInfoDto leavingInfoDto) {
		LeavingInfo leavingInfo = leavingInfoService.getbyid(id);

		if (leavingInfo == null) {
			return new ResponseEntity<LeavingInfo>(HttpStatus.NOT_FOUND);
		} else {
			leavingInfo.setStudentId(studentService.getbyid(leavingInfoDto.getStudentId()));
			leavingInfo.setSchoolUdise(schoolService.getbyid(leavingInfoDto.getSchoolUdise()));
			leavingInfo.setProgress(leavingInfoDto.getProgress());
			leavingInfo.setBehavior(leavingInfoDto.getBehavior());
			leavingInfo.setDateOfLeavingSchool(leavingInfoDto.getDateOfLeavingSchool());
			leavingInfo.setReasonOfLeavingSchool(leavingInfoDto.getReasonOfLeavingSchool());
			leavingInfo.setRemark(leavingInfoDto.getRemark());
			leavingInfo.setLcNumber(leavingInfoDto.getLcNumber());
			leavingInfo.setLcDate(leavingInfoDto.getLcDate());
			leavingInfo.setOtherRemark(leavingInfoDto.getOtherRemark());
			leavingInfo.setCreatedAt(leavingInfoDto.getCreatedAt());

			LeavingInfo saveLeavingInfo = leavingInfoService.post(leavingInfo);

			return new ResponseEntity<LeavingInfo>(saveLeavingInfo, HttpStatus.CREATED);
		}
	}

	@GetMapping("/getbystudentId/{studentId}/udise/{udise}")
	public ResponseEntity<LeavingInfo> getDataByStudentAndUdise(@PathVariable long studentId,
			@PathVariable long udise) {
		Student student = studentService.getbyid(studentId);

		School school = schoolService.getbyid(udise);

		LeavingInfo leavingInfo = leavingInfoService.getdatabystudentId(student, school);

		return new ResponseEntity<LeavingInfo>(leavingInfo, HttpStatus.OK);
	}

	@GetMapping("/checkingisdatapresent/{studentId}/udise/{udise}")
	public ResponseEntity<Boolean> Checkvalidornot(@PathVariable long studentId, @PathVariable long udise) {
		Student student = studentService.getbyid(studentId);

		School school = schoolService.getbyid(udise);

		LeavingInfo leavingInfo = leavingInfoService.getdatabystudentId(student, school);

		if (leavingInfo != null) {
			return ResponseEntity.ok(true);
		} else {
			return ResponseEntity.ok(false);
		}
	}
//save flag of original printed or not
	@PutMapping("/markprinted/{studentId}/udise/{udise}")
	public ResponseEntity<String> markAsPrinted(@PathVariable long studentId, @PathVariable long udise) {
		Student student = studentService.getbyid(studentId);
		School school = schoolService.getbyid(udise);
		LeavingInfo leavingInfo = leavingInfoService.getdatabystudentId(student, school);
		System.out.println(studentId);
		if (leavingInfo.isPrinted()) {
			return ResponseEntity.badRequest().body("Already printed.");
		}

		leavingInfo.setPrinted(true);
		LeavingInfo saveLeavingInfo = leavingInfoService.post(leavingInfo);
		System.out.println(saveLeavingInfo);
		return ResponseEntity.ok("Marked as printed.");
	}
	

	@PutMapping("/marknewlcprinted/{studentId}/udise/{udise}")
	public ResponseEntity<String> markAsLcNewPrinted(@PathVariable long studentId, @PathVariable long udise) {
		Student student = studentService.getbyid(studentId);
		School school = schoolService.getbyid(udise);
		LeavingInfo leavingInfo = leavingInfoService.getdatabystudentId(student, school);
//		System.out.println(studentId);
		if (leavingInfo.isNewlcprinted()) {
			return ResponseEntity.badRequest().body("Already printed.");
		}

		leavingInfo.setNewlcprinted(true);
		LeavingInfo saveLeavingInfo = leavingInfoService.post(leavingInfo);
//		System.out.println(saveLeavingInfo);
		return ResponseEntity.ok("Marked as printed.");
	}
	


//	@PutMapping("/markprint/{studentId}/{udise}")
//	public ResponseEntity<String> markprinted(@PathVariable long studentId,@PathVariable long udise)
//	{
//		Student student=studentService.getbyid(studentId);
//		System.out.println(student);
//		return null;
//	}

	@GetMapping("/checkisprinted/{studentId}/udise/{udise}")
	public ResponseEntity<Boolean> printedOrNot(@PathVariable long studentId, @PathVariable long udise) {
		Student student = studentService.getbyid(studentId);
		School school = schoolService.getbyid(udise);
		LeavingInfo leavingInfo = leavingInfoService.getdatabystudentId(student, school);

		if (leavingInfo.isPrinted()) {
			// return ResponseEntity.badRequest().body("Already printed.");
			return new ResponseEntity<Boolean>(true, HttpStatus.OK);
		}

		return ResponseEntity.ok(false);
	}

	@PutMapping("/lc/duplicate-count/{studentId}/udise/{udise}")
	public ResponseEntity<LeavingInfo> duplicateLcCount(@PathVariable long studentId, @PathVariable long udise) {
		Student student = studentService.getbyid(studentId);
		School school = schoolService.getbyid(udise);
		LeavingInfo leavingInfo = leavingInfoService.getdatabystudentId(student, school);

		int count = leavingInfo.getDuplicatePrintCount();
		leavingInfo.setDuplicatePrintCount(count + 1);

		return new ResponseEntity<LeavingInfo>(leavingInfo, HttpStatus.OK);
	}
	
	@PutMapping("/newlc/duplicate-count/{studentId}/udise/{udise}")
	public ResponseEntity<LeavingInfo> duplicateNewLcCount(@PathVariable long studentId, @PathVariable long udise) {
		Student student = studentService.getbyid(studentId);
		School school = schoolService.getbyid(udise);
		LeavingInfo leavingInfo = leavingInfoService.getdatabystudentId(student, school);

		int count = leavingInfo.getDuplicateNewLcCount();
		leavingInfo.setDuplicateNewLcCount(count + 1);

		return new ResponseEntity<LeavingInfo>(leavingInfo, HttpStatus.OK);
	}


	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletedat(@PathVariable long id) {
		leavingInfoService.deletedata(id);
		return new ResponseEntity<Void>(HttpStatus.OK);
	}
}
