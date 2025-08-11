<?php

namespace App\Http\Controllers;

use App\Models\Tyfcb;
use App\Models\Referral;
use App\Models\FaceToFace;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use League\Csv\Writer;

class ReportController extends Controller
{
    // Get report data - Modified to use logged-in user's profile_id
    public function getReport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
            'report_type' => 'required|in:tyfcb,referral,face_to_face,all'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $fromDate = Carbon::parse($request->from_date)->startOfDay();
            $toDate = Carbon::parse($request->to_date)->endOfDay();
            $reportType = $request->report_type;
            $profileId = Auth::user()->profile_id;

            $data = [];

            // Fetch TYFCB data
            if ($reportType === 'tyfcb' || $reportType === 'all') {
                $tyfcbQuery = Tyfcb::with(['thankYouToUser:profile_id,first_name,last_name'])
                    ->where('profile_id', $profileId)
                    ->whereBetween('created_at', [$fromDate, $toDate]);
                
                $data['tyfcb'] = $tyfcbQuery->get()->map(function ($item) {
                    return [
                        'id' => $item->tyfcb_id,
                        'thank_you_to' => $item->thankYouToUser ? $item->thankYouToUser->first_name . ' ' . $item->thankYouToUser->last_name : 'Unknown',
                        'referral_amount' => $item->referral_amount,
                        'business_type' => $item->business_type,
                        'referral_type' => $item->referral_type,
                        'comments' => $item->comments ?: '',
                        'created_at' => $item->created_at->format('Y-m-d H:i:s')
                    ];
                });
            }

            // Fetch Referral data
            if ($reportType === 'referral' || $reportType === 'all') {
                $referralQuery = Referral::with(['referredToUser:profile_id,first_name,last_name'])
                    ->where('profile_id', $profileId)
                    ->whereBetween('created_at', [$fromDate, $toDate]);
                
                $data['referral'] = $referralQuery->get()->map(function ($item) {
                    return [
                        'id' => $item->referral_id,
                        'referred_to' => $item->referredToUser ? $item->referredToUser->first_name . ' ' . $item->referredToUser->last_name : 'Unknown',
                        'lead_type' => $item->lead_type,
                        'referral_type' => $item->referral_type,
                        'referral_status' => $item->referral_status,
                        'mobile_number' => $item->mobile_number ?: '',
                        'email' => $item->email ?: '',
                        'address' => $item->address ?: '',
                        'comments' => $item->comments ?: '',
                        'created_at' => $item->created_at->format('Y-m-d H:i:s')
                    ];
                });
            }

            // Fetch Face to Face data
            if ($reportType === 'face_to_face' || $reportType === 'all') {
                $faceToFaceQuery = FaceToFace::with([
                    'metWithUser:profile_id,first_name,last_name',
                    'invitedByUser:profile_id,first_name,last_name'
                ])
                    ->where('profile_id', $profileId)
                    ->whereBetween('created_at', [$fromDate, $toDate]);
                
                $data['face_to_face'] = $faceToFaceQuery->get()->map(function ($item) {
                    return [
                        'id' => $item->face_to_face_id,
                        'met_with' => $item->metWithUser ? $item->metWithUser->first_name . ' ' . $item->metWithUser->last_name : 'Unknown',
                        'invited_by' => $item->invitedByUser ? $item->invitedByUser->first_name . ' ' . $item->invitedByUser->last_name : 'Unknown',
                        'location' => $item->location,
                        'date' => $item->date->format('Y-m-d'),
                        'created_at' => $item->created_at->format('Y-m-d H:i:s')
                    ];
                });
            }

            // Get summary statistics
            $summary = $this->getReportSummary($fromDate, $toDate, $reportType, $profileId);

            return response()->json([
                'success' => true,
                'data' => $data,
                'summary' => $summary,
                'filters' => [
                    'from_date' => $fromDate->format('Y-m-d'),
                    'to_date' => $toDate->format('Y-m-d'),
                    'report_type' => $reportType
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Export report as PDF
    public function exportPdf(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
            'report_type' => 'required|in:tyfcb,referral,face_to_face,all'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Get report data
            $reportResponse = $this->getReport($request);
            $reportData = json_decode($reportResponse->getContent(), true);

            if (!$reportData['success']) {
                return $reportResponse;
            }

            // Get logged-in user details for PDF
            $user = Auth::user();

            // Generate PDF
            $pdf = PDF::loadView('reports.pdf-template', [
                'data' => $reportData['data'],
                'summary' => $reportData['summary'],
                'user' => [
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email
                ],
                'filters' => $reportData['filters']
            ]);

            $filename = 'my_report_' . $request->report_type . '_' . date('Y-m-d_His') . '.pdf';

            return $pdf->download($filename);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Export report as CSV
    public function exportCsv(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
            'report_type' => 'required|in:tyfcb,referral,face_to_face,all'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Get report data
            $reportResponse = $this->getReport($request);
            $reportData = json_decode($reportResponse->getContent(), true);

            if (!$reportData['success']) {
                return $reportResponse;
            }

            // Get logged-in user details
            $user = Auth::user();

            $csv = Writer::createFromString('');
            
            // Add report header
            $csv->insertOne(['My Report Generated on: ' . date('Y-m-d H:i:s')]);
            $csv->insertOne(['User: ' . $user->first_name . ' ' . $user->last_name]);
            $csv->insertOne(['From Date: ' . $reportData['filters']['from_date']]);
            $csv->insertOne(['To Date: ' . $reportData['filters']['to_date']]);
            $csv->insertOne(['Report Type: ' . ucfirst(str_replace('_', ' ', $reportData['filters']['report_type']))]);
            $csv->insertOne([]); // Empty row

            // Add data based on report type
            if (isset($reportData['data']['tyfcb']) && count($reportData['data']['tyfcb']) > 0) {
                $csv->insertOne(['TYFCB Report']);
                $csv->insertOne(['ID', 'Thank You To', 'Amount', 'Business Type', 'Referral Type', 'Comments', 'Created At']);
                foreach ($reportData['data']['tyfcb'] as $row) {
                    $csv->insertOne([
                        $row['id'],
                        $row['thank_you_to'],
                        $row['referral_amount'],
                        $row['business_type'],
                        $row['referral_type'],
                        $row['comments'],
                        $row['created_at']
                    ]);
                }
                $csv->insertOne([]); // Empty row
            }

            if (isset($reportData['data']['referral']) && count($reportData['data']['referral']) > 0) {
                $csv->insertOne(['Referral Report']);
                $csv->insertOne(['ID', 'Referred To', 'Lead Type', 'Referral Type', 'Status', 'Mobile', 'Email', 'Address', 'Comments', 'Created At']);
                foreach ($reportData['data']['referral'] as $row) {
                    $csv->insertOne([
                        $row['id'],
                        $row['referred_to'],
                        $row['lead_type'],
                        $row['referral_type'],
                        $row['referral_status'],
                        $row['mobile_number'],
                        $row['email'],
                        $row['address'],
                        $row['comments'],
                        $row['created_at']
                    ]);
                }
                $csv->insertOne([]); // Empty row
            }

            if (isset($reportData['data']['face_to_face']) && count($reportData['data']['face_to_face']) > 0) {
                $csv->insertOne(['Face to Face Report']);
                $csv->insertOne(['ID', 'Met With', 'Invited By', 'Location', 'Date', 'Created At']);
                foreach ($reportData['data']['face_to_face'] as $row) {
                    $csv->insertOne([
                        $row['id'],
                        $row['met_with'],
                        $row['invited_by'],
                        $row['location'],
                        $row['date'],
                        $row['created_at']
                    ]);
                }
            }

            $filename = 'my_report_' . $request->report_type . '_' . date('Y-m-d_His') . '.csv';

            return response($csv->getContent(), 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate CSV',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Private method to get report summary
    private function getReportSummary($fromDate, $toDate, $reportType, $profileId)
    {
        $summary = [];

        if ($reportType === 'tyfcb' || $reportType === 'all') {
            $tyfcbQuery = Tyfcb::where('profile_id', $profileId)
                ->whereBetween('created_at', [$fromDate, $toDate]);
            
            $summary['tyfcb'] = [
                'total_count' => $tyfcbQuery->count(),
                'total_amount' => $tyfcbQuery->sum('referral_amount'),
                'by_business_type' => $tyfcbQuery->select('business_type', DB::raw('count(*) as count'), DB::raw('sum(referral_amount) as total'))
                    ->groupBy('business_type')
                    ->get(),
                'by_referral_type' => $tyfcbQuery->select('referral_type', DB::raw('count(*) as count'))
                    ->groupBy('referral_type')
                    ->get()
            ];
        }

        if ($reportType === 'referral' || $reportType === 'all') {
            $referralQuery = Referral::where('profile_id', $profileId)
                ->whereBetween('created_at', [$fromDate, $toDate]);
            
            $summary['referral'] = [
                'total_count' => $referralQuery->count(),
                'by_lead_type' => $referralQuery->select('lead_type', DB::raw('count(*) as count'))
                    ->groupBy('lead_type')
                    ->get(),
                'by_referral_type' => $referralQuery->select('referral_type', DB::raw('count(*) as count'))
                    ->groupBy('referral_type')
                    ->get(),
                'by_status' => $referralQuery->select('referral_status', DB::raw('count(*) as count'))
                    ->groupBy('referral_status')
                    ->get()
            ];
        }

        if ($reportType === 'face_to_face' || $reportType === 'all') {
            $faceToFaceQuery = FaceToFace::where('profile_id', $profileId)
                ->whereBetween('created_at', [$fromDate, $toDate]);
            
            $summary['face_to_face'] = [
                'total_count' => $faceToFaceQuery->count(),
                'by_location' => $faceToFaceQuery->select('location', DB::raw('count(*) as count'))
                    ->groupBy('location')
                    ->orderBy('count', 'desc')
                    ->limit(10)
                    ->get()
            ];
        }

        return $summary;
    }
}